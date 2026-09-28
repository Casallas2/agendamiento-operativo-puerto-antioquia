export type Prioridad = 'Alta' | 'Media' | 'Baja';

export interface HistoriaUsuario {
  id: string;
  rol: string;
  quiero: string;
  para: string;
  criteriosAceptacion: string[];
  prioridad: Prioridad;
  puntos: number;
  sprint: number;
  requisitos: string[];
  rutaPrototipo: string;
}

export interface Sprint {
  numero: number;
  nombre: string;
  objetivo: string;
  semanas: string;
  incremento: string;
  justificacion: string;
}

export interface PrincipioUx {
  principio: string;
  aplicacion: string;
  evidencia: string;
}

export interface VistaPrototipo {
  nombre: string;
  ruta: string;
  rol: string;
  categoria: string;
  microservicios: string;
  eventos: string;
}
