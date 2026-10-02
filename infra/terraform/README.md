# Infraestructura como código

Declara el entorno de la plataforma en AWS: PostgreSQL 18 administrado (RDS, cifrado y sin
acceso público) y AWS Config con reglas que auditan que esa configuración no se desvíe.

```bash
cd infra/terraform
export TF_VAR_db_contrasena='<secreto>'   # nunca se escribe en un archivo versionado
terraform init
terraform plan -var="version_aplicacion=v1.1.0"
terraform apply
```

El estado de Terraform (`*.tfstate`) y las variables locales (`*.tfvars`) están excluidos de Git
porque contienen secretos. Es un prototipo académico: no hay un despliegue activo.
