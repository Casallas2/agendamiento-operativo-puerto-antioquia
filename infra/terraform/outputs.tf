output "endpoint_base_datos" {
  description = "Host para DB_HOST en Backend/.env del entorno desplegado"
  value       = aws_db_instance.agendamiento.address
}

output "bucket_historial_config" {
  description = "Bucket donde AWS Config guarda el historial de configuración"
  value       = aws_s3_bucket.historial_config.bucket
}
