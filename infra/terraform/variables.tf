variable "region" {
  description = "Región de AWS más cercana a Urabá"
  type        = string
  default     = "us-east-1"
}

variable "entorno" {
  description = "Entorno desplegado: desarrollo, pruebas o produccion"
  type        = string
  default     = "pruebas"
}

variable "version_aplicacion" {
  description = "Etiqueta Git de la línea base desplegada (SemVer)"
  type        = string
  default     = "v1.0.0"
}

variable "db_usuario" {
  description = "Usuario administrador de PostgreSQL"
  type        = string
  default     = "puerto_admin"
}

variable "db_contrasena" {
  description = "Contraseña de PostgreSQL. Se inyecta por TF_VAR_db_contrasena, nunca se versiona"
  type        = string
  sensitive   = true
}
