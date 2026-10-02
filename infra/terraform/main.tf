# Infraestructura como código del entorno de la plataforma (ECS-PRG-14).
# Terraform declara el estado deseado; AWS Config verifica que el estado real no se desvíe.

# --- Base de datos: PostgreSQL 18 administrado (ECS-DAT-01 se despliega aquí) ---
resource "aws_db_instance" "agendamiento" {
  identifier        = "agendamiento-operativo-${var.entorno}"
  engine            = "postgres"
  engine_version    = "18"
  instance_class    = "db.t4g.micro"
  allocated_storage = 20
  db_name           = "agendamiento_operativo"
  username          = var.db_usuario
  password          = var.db_contrasena

  # RNF-02: datos sensibles cifrados en reposo
  storage_encrypted         = true
  backup_retention_period   = 7
  deletion_protection       = true
  skip_final_snapshot       = false
  final_snapshot_identifier = "agendamiento-operativo-${var.entorno}-final"
  publicly_accessible       = false
}

# --- Auditoría continua de la configuración con AWS Config ---
resource "aws_s3_bucket" "historial_config" {
  bucket_prefix = "puerto-antioquia-config-"
}

resource "aws_iam_role" "config" {
  name_prefix = "puerto-antioquia-config-"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "config.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "config" {
  role       = aws_iam_role.config.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWS_ConfigRole"
}

resource "aws_config_configuration_recorder" "principal" {
  name     = "puerto-antioquia"
  role_arn = aws_iam_role.config.arn

  recording_group {
    all_supported = true
  }
}

resource "aws_config_delivery_channel" "principal" {
  name           = "puerto-antioquia"
  s3_bucket_name = aws_s3_bucket.historial_config.bucket
  depends_on     = [aws_config_configuration_recorder.principal]
}

resource "aws_config_configuration_recorder_status" "principal" {
  name       = aws_config_configuration_recorder.principal.name
  is_enabled = true
  depends_on = [aws_config_delivery_channel.principal]
}

# Reglas administradas: alertan si alguien desvía la base de datos de su configuración aprobada
resource "aws_config_config_rule" "rds_cifrado" {
  name = "rds-almacenamiento-cifrado"
  source {
    owner             = "AWS"
    source_identifier = "RDS_STORAGE_ENCRYPTED"
  }
  depends_on = [aws_config_configuration_recorder.principal]
}

resource "aws_config_config_rule" "rds_no_publico" {
  name = "rds-sin-acceso-publico"
  source {
    owner             = "AWS"
    source_identifier = "RDS_INSTANCE_PUBLIC_ACCESS_CHECK"
  }
  depends_on = [aws_config_configuration_recorder.principal]
}

resource "aws_config_config_rule" "rds_respaldos" {
  name = "rds-respaldos-habilitados"
  source {
    owner             = "AWS"
    source_identifier = "DB_INSTANCE_BACKUP_ENABLED"
  }
  depends_on = [aws_config_configuration_recorder.principal]
}
