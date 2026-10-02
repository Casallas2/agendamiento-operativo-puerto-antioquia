terraform {
  required_version = ">= 1.9"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region

  # Toda pieza de infraestructura queda etiquetada con su línea base de configuración
  default_tags {
    tags = {
      Proyecto = "agendamiento-operativo-puerto-antioquia"
      Entorno  = var.entorno
      Version  = var.version_aplicacion
    }
  }
}
