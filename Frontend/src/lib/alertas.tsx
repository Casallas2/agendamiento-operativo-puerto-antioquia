'use client';

import Swal, { type SweetAlertIcon, type SweetAlertOptions } from 'sweetalert2';
import withReactContent, { type ReactSweetAlertOptions } from 'sweetalert2-react-content';
import { buttonVariants } from '@/components/ui/button';
import {
  ContenidoRetrasoAlerta,
  LONGITUD_MAXIMA_MOTIVO,
  type DatosRetraso,
} from '@/components/shared/alertas/ContenidoRetrasoAlerta';
import { ContenidoSeleccionAlerta, type OpcionAlerta } from '@/components/shared/alertas/ContenidoSeleccionAlerta';
import { cn } from '@/lib/utils';

export type { DatosRetraso } from '@/components/shared/alertas/ContenidoRetrasoAlerta';
export type { OpcionAlerta } from '@/components/shared/alertas/ContenidoSeleccionAlerta';

/**
 * Punto único para las alertas con SweetAlert2.
 * Reason: centralizar tema, textos y botones garantiza consistencia visual (principio de consistencia):
 * los botones reutilizan `buttonVariants` de components/ui y los formularios internos se construyen
 * con los mismos componentes (RadioGroup, Textarea, Label) que el resto de la interfaz.
 */

const SwalReact = withReactContent(Swal);

const CLASE_BOTON_ALERTA = 'h-10 min-w-28 px-4 text-sm';

const obtenerTemaActual = () =>
  document.documentElement.classList.contains('dark') ? ('dark' as const) : ('light' as const);

const obtenerClasesAlerta = (esPeligrosa = false): SweetAlertOptions['customClass'] => ({
  popup: 'rounded-2xl! font-sans',
  title: 'text-xl! font-semibold!',
  htmlContainer: 'text-base!',
  actions: 'gap-2',
  confirmButton: cn(buttonVariants({ variant: esPeligrosa ? 'destructive' : 'default', size: 'lg' }), CLASE_BOTON_ALERTA),
  cancelButton: cn(buttonVariants({ variant: 'outline', size: 'lg' }), CLASE_BOTON_ALERTA),
  validationMessage: 'text-sm!',
});

const alertaBase = (esPeligrosa = false) =>
  SwalReact.mixin({
    theme: obtenerTemaActual(),
    buttonsStyling: false,
    customClass: obtenerClasesAlerta(esPeligrosa),
    reverseButtons: true,
    focusCancel: false,
    cancelButtonText: 'Volver',
  });

// Reason: los tipos de sweetalert2-react-content no conservan la unión discriminada de `input` al pasar opciones por variable
const abrirDialogo = (opciones: ReactSweetAlertOptions, esPeligrosa = false) =>
  alertaBase(esPeligrosa).fire(opciones as SweetAlertOptions);

export const mostrarAlertaExito = (titulo: string, texto?: string) =>
  abrirDialogo({ icon: 'success', title: titulo, text: texto, confirmButtonText: 'Entendido' });

export const mostrarAlertaError = (titulo: string, texto?: string) =>
  abrirDialogo({ icon: 'error', title: titulo, text: texto, confirmButtonText: 'Revisar' });

export const mostrarAlertaInformativa = (titulo: string, html: string, icono: SweetAlertIcon = 'info') =>
  abrirDialogo({ icon: icono, title: titulo, html, confirmButtonText: 'Cerrar' });

interface OpcionesConfirmacion {
  titulo: string;
  texto: string;
  textoConfirmar: string;
  esPeligrosa?: boolean;
}

/** Prevención de errores: toda acción destructiva o irreversible pide confirmación explícita */
export const confirmarAccion = async ({ titulo, texto, textoConfirmar, esPeligrosa = false }: OpcionesConfirmacion) => {
  const resultado = await abrirDialogo(
    {
      icon: esPeligrosa ? 'warning' : 'question',
      title: titulo,
      text: texto,
      showCancelButton: true,
      confirmButtonText: textoConfirmar,
    },
    esPeligrosa,
  );
  return resultado.isConfirmed;
};

interface OpcionesSeleccion {
  titulo: string;
  texto: string;
  opciones: OpcionAlerta[];
  textoConfirmar: string;
}

export const solicitarSeleccion = async ({ titulo, texto, opciones, textoConfirmar }: OpcionesSeleccion) => {
  let valorSeleccionado = '';
  const resultado = await abrirDialogo({
    title: titulo,
    html: (
      <ContenidoSeleccionAlerta
        texto={texto}
        opciones={opciones}
        alCambiar={(valor) => {
          valorSeleccionado = valor;
          Swal.resetValidationMessage();
        }}
      />
    ),
    showCancelButton: true,
    confirmButtonText: textoConfirmar,
    focusConfirm: false,
    preConfirm: () => {
      if (!valorSeleccionado) {
        Swal.showValidationMessage('Selecciona una opción para continuar');
        return false;
      }
      return valorSeleccionado;
    },
  });
  return resultado.isConfirmed ? valorSeleccionado : null;
};

const LONGITUD_MINIMA_MOTIVO = 5;

export const solicitarDatosRetraso = async (nombreMuelle: string) => {
  let datosRetraso: DatosRetraso = { minutos: 60, motivo: '' };
  const opciones: ReactSweetAlertOptions = {
    icon: 'warning',
    title: `Declarar retraso en ${nombreMuelle}`,
    html: (
      <ContenidoRetrasoAlerta
        datosIniciales={datosRetraso}
        alCambiar={(datos) => {
          datosRetraso = datos;
          Swal.resetValidationMessage();
        }}
      />
    ),
    width: '36rem',
    showCancelButton: true,
    confirmButtonText: 'Declarar y notificar',
    focusConfirm: false,
    preConfirm: () => {
      const motivo = datosRetraso.motivo.trim();
      if (motivo.length < LONGITUD_MINIMA_MOTIVO) {
        Swal.showValidationMessage(`Describe el motivo en al menos ${LONGITUD_MINIMA_MOTIVO} caracteres`);
        return false;
      }
      return { minutos: datosRetraso.minutos, motivo: motivo.slice(0, LONGITUD_MAXIMA_MOTIVO) };
    },
  };
  const resultado = await abrirDialogo(opciones, true);
  return resultado.isConfirmed ? (resultado.value as DatosRetraso) : null;
};

type TipoAviso = 'INFO' | 'EXITO' | 'ALERTA' | 'ERROR';

const ICONO_POR_TIPO: Record<TipoAviso, SweetAlertIcon> = {
  INFO: 'info',
  EXITO: 'success',
  ALERTA: 'warning',
  ERROR: 'error',
};

const hayDialogoAbierto = () => Swal.isVisible() && !Swal.getPopup()?.classList.contains('swal2-toast');

/** Aviso emergente no bloqueante para las notificaciones en tiempo real (RF-03) */
export const mostrarAvisoEmergente = (titulo: string, texto: string, tipo: TipoAviso = 'INFO') => {
  // Reason: SweetAlert2 muestra una sola ventana a la vez; un aviso en tiempo real cerraría el diálogo
  // que el usuario está llenando. El aviso no se pierde: queda en el panel de notificaciones.
  if (hayDialogoAbierto()) {
    return undefined;
  }
  return Swal.fire({
    toast: true,
    position: 'top-end',
    theme: obtenerTemaActual(),
    customClass: { popup: 'rounded-xl! font-sans' },
    icon: ICONO_POR_TIPO[tipo],
    title: titulo,
    text: texto,
    showConfirmButton: false,
    showCloseButton: true,
    timer: 6000,
    timerProgressBar: true,
  });
};
