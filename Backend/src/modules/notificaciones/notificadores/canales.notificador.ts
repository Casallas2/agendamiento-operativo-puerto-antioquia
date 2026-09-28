import type { CanalNotificacion, RolUsuario } from 'src/common/types/dominio.type';
import type { EventoDominio } from 'src/modules/eventos/types';

/**
 * Interfaz ObservadorNotificacion del diagrama de clases: cada canal decide
 * de forma autónoma si el evento le corresponde o no.
 */
export interface NotificadorCanal {
  readonly canal: CanalNotificacion;
  debeEntregar(evento: EventoDominio, rolDestinatario: RolUsuario): boolean;
}

const notificadorPush: NotificadorCanal = {
  canal: 'PUSH',
  debeEntregar: () => true,
};

const notificadorSms: NotificadorCanal = {
  canal: 'SMS',
  // SMS solo para eventos críticos: sirve aun con conectividad intermitente en el corredor vial
  debeEntregar: (evento) => evento.severidad === 'ALERTA' || evento.severidad === 'ERROR',
};

const notificadorVoz: NotificadorCanal = {
  canal: 'VOZ',
  // R-01: el conductor recibe los avisos por voz para no manipular el teléfono en cabina
  debeEntregar: (_evento, rolDestinatario) => rolDestinatario === 'CONDUCTOR',
};

export const NOTIFICADORES_REGISTRADOS: NotificadorCanal[] = [
  notificadorPush,
  notificadorSms,
  notificadorVoz,
];

/** Canales por los que debe salir el evento para un destinatario concreto */
export const resolverCanales = (evento: EventoDominio, rol: RolUsuario): CanalNotificacion[] =>
  NOTIFICADORES_REGISTRADOS
    .filter((notificador) => notificador.debeEntregar(evento, rol))
    .map((notificador) => notificador.canal);
