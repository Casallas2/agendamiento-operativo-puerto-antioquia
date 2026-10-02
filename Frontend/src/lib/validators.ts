import { z } from 'zod';

export const credencialesSchema = z.object({
  correo: z.string().trim().min(1, 'Escribe tu correo').email('El correo no tiene un formato válido'),
  contrasena: z.string().min(8, 'La contraseña tiene al menos 8 caracteres'),
});

export const codigoMfaSchema = z.object({
  codigo: z.string().regex(/^\d{6}$/, 'El código tiene exactamente 6 números'),
});

export const PATRON_MANIFIESTO = /^MAN-\d{4}-\d{6}$/;
export const PATRON_BL = /^BL-[A-Z]{2}-\d{5}$/;
export const PATRON_CERTIFICADO_ICA = /^CFE-\d{4}-\d{6}$/;
export const LONGITUD_MAXIMA_OBSERVACIONES = 200;

/** Validación de formato en el cliente: se detectan errores antes de consultar a la DIAN */
export const crearTurnoSchema = z.object({
  vehiculoId: z.string().min(1, 'Selecciona el vehículo'),
  conductorId: z.string().min(1, 'Selecciona el conductor'),
  tipoOperacion: z.enum(['EXPORTACION', 'IMPORTACION'], { error: 'Selecciona el tipo de operación' }),
  tipoCarga: z.string().min(1, 'Selecciona el tipo de carga'),
  numeroManifiesto: z
    .string()
    .trim()
    .toUpperCase()
    .regex(PATRON_MANIFIESTO, 'Formato esperado: MAN-2026-004561'),
  numeroBl: z.string().trim().toUpperCase().regex(PATRON_BL, 'Formato esperado: BL-PA-88275'),
  cargaRefrigerada: z.boolean(),
  numeroCertificadoIca: z.string().trim().toUpperCase(),
  fecha: z.string().min(1, 'Selecciona el día'),
  franjaId: z.string().min(1, 'Selecciona una franja horaria disponible'),
  observaciones: z.string().trim().max(LONGITUD_MAXIMA_OBSERVACIONES, `Máximo ${LONGITUD_MAXIMA_OBSERVACIONES} caracteres`),
  aceptaDeclaracion: z.boolean().refine((aceptada) => aceptada, 'Debes confirmar que la información es verídica'),
}).refine(
  // OCI-001: la carga refrigerada de exportación exige el certificado fitosanitario del ICA
  (turno) => !turno.cargaRefrigerada || PATRON_CERTIFICADO_ICA.test(turno.numeroCertificadoIca),
  { path: ['numeroCertificadoIca'], message: 'Formato esperado: CFE-2026-001204' },
);

export type CrearTurnoFormulario = z.infer<typeof crearTurnoSchema>;
export type CredencialesFormulario = z.infer<typeof credencialesSchema>;
export type CodigoMfaFormulario = z.infer<typeof codigoMfaSchema>;
