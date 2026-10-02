import type { Repository } from 'typeorm';
import type { RegistroExterno } from '../entities';
import { validacionesAplicables } from '../catalogo-validaciones';
import { AdaptadorIca } from './ica.adapter';

jest.mock('./validador-externo.interface', () => ({
  simularLatencia: () => Promise.resolve(),
}));

/** Repositorio en memoria: el ICA "conoce" solo los certificados de esta lista */
const crearAdaptador = (certificadosExpedidos: string[]) => {
  const repositorio = {
    exists: jest.fn(({ where }: { where: { sistema: string; numero: string } }) =>
      Promise.resolve(where.sistema === 'ICA' && certificadosExpedidos.includes(where.numero)),
    ),
  } as unknown as Repository<RegistroExterno>;
  return new AdaptadorIca(repositorio);
};

const DOCUMENTO = { numeroManifiesto: 'MAN-2026-004512', numeroBl: 'BL-PA-88213' };

describe('AdaptadorIca (OCI-001)', () => {
  it('aprueba un certificado fitosanitario expedido', async () => {
    const resultado = await crearAdaptador(['CFE-2026-001204']).validarDocumentoCarga({
      ...DOCUMENTO,
      numeroCertificadoIca: 'CFE-2026-001204',
    });
    expect(resultado).toEqual({ aprobado: true, mensaje: 'Certificado fitosanitario expedido por el ICA' });
  });

  it('rechaza un certificado que el ICA no expidió', async () => {
    const resultado = await crearAdaptador(['CFE-2026-001204']).validarDocumentoCarga({
      ...DOCUMENTO,
      numeroCertificadoIca: 'CFE-2026-009999',
    });
    expect(resultado.aprobado).toBe(false);
    expect(resultado.mensaje).toBe('El certificado fitosanitario no está expedido por el ICA');
  });

  it('rechaza la carga refrigerada que llega sin certificado', async () => {
    const resultado = await crearAdaptador([]).validarDocumentoCarga(DOCUMENTO);
    expect(resultado).toEqual({ aprobado: false, mensaje: 'Falta el certificado fitosanitario del ICA' });
  });
});

describe('validacionesAplicables', () => {
  it('la carga general conserva sus cinco validaciones originales', () => {
    expect(validacionesAplicables(false).map((v) => v.tipo)).toEqual([
      'MANIFIESTO_DIAN', 'BL_OPERADOR', 'LICENCIA_RUNT', 'SOAT', 'TECNOMECANICA',
    ]);
  });

  it('la carga refrigerada suma el certificado fitosanitario del ICA', () => {
    expect(validacionesAplicables(true).map((v) => v.tipo)).toContain('CERTIFICADO_ICA');
    expect(validacionesAplicables(true)).toHaveLength(6);
  });
});
