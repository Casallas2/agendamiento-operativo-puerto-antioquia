import { SetMetadata } from '@nestjs/common';
import type { RolUsuario } from '../types/dominio.type';

export const CLAVE_ROLES = 'rolesPermitidos';

/** Restringe un endpoint a los roles indicados; se evalúa en `RolesGuard` */
export const Roles = (...roles: RolUsuario[]) => SetMetadata(CLAVE_ROLES, roles);
