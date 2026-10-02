import {
  Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import {
  ESTADOS_TURNO, TIPOS_OPERACION,
  type EstadoTurno, type TipoOperacion,
} from 'src/common/types/dominio.type';
import { Conductor, Empresa, Vehiculo } from 'src/modules/flota/entities';
import { Muelle } from 'src/modules/muelles/entities';
import { EventoTurno } from './evento-turno.entity';
import { Franja } from './franja.entity';
import { ValidacionTurno } from './validacion-turno.entity';

@Entity('turnos')
export class Turno {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('IDX_TURNO_CODIGO', { unique: true })
  @Column({ type: 'varchar', length: 20 })
  codigo: string;

  @Index('IDX_TURNO_EMPRESA')
  @Column({ type: 'uuid', name: 'empresa_id' })
  empresaId: string;

  @ManyToOne(() => Empresa, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ type: 'uuid', name: 'vehiculo_id' })
  vehiculoId: string;

  @ManyToOne(() => Vehiculo, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'vehiculo_id' })
  vehiculo: Vehiculo;

  @Index('IDX_TURNO_CONDUCTOR')
  @Column({ type: 'uuid', name: 'conductor_id' })
  conductorId: string;

  @ManyToOne(() => Conductor, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'conductor_id' })
  conductor: Conductor;

  @Index('IDX_TURNO_MUELLE')
  @Column({ type: 'uuid', name: 'muelle_id' })
  muelleId: string;

  @ManyToOne(() => Muelle, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'muelle_id' })
  muelle: Muelle;

  @Column({ type: 'uuid', name: 'franja_id' })
  franjaId: string;

  @ManyToOne(() => Franja, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'franja_id' })
  franja: Franja;

  @Index('IDX_TURNO_INICIO')
  @Column({ type: 'timestamptz' })
  inicio: Date;

  @Column({ type: 'timestamptz' })
  fin: Date;

  @Column({ type: 'enum', enum: TIPOS_OPERACION, name: 'tipo_operacion' })
  tipoOperacion: TipoOperacion;

  @Column({ type: 'varchar', length: 80, name: 'tipo_carga' })
  tipoCarga: string;

  /** Carga perecedera en contenedor refrigerado: usa la cuota prioritaria de la franja (OCI-001) */
  @Column({ type: 'boolean', default: false, name: 'carga_refrigerada' })
  cargaRefrigerada: boolean;

  /** Certificado fitosanitario de exportación del ICA; solo aplica a carga refrigerada */
  @Column({ type: 'varchar', length: 40, name: 'numero_certificado_ica', nullable: true })
  numeroCertificadoIca: string | null;

  @Index('IDX_TURNO_MANIFIESTO')
  @Column({ type: 'varchar', length: 40, name: 'numero_manifiesto' })
  numeroManifiesto: string;

  @Column({ type: 'varchar', length: 40, name: 'numero_bl' })
  numeroBl: string;

  @Index('IDX_TURNO_ESTADO')
  @Column({ type: 'enum', enum: ESTADOS_TURNO, default: 'PENDIENTE_VALIDACION' })
  estado: EstadoTurno;

  @Column({ type: 'int', default: 0, name: 'retraso_minutos' })
  retrasoMinutos: number;

  @Column({ type: 'varchar', length: 255, name: 'motivo_rechazo', nullable: true })
  motivoRechazo: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  observaciones: string | null;

  @OneToMany(() => ValidacionTurno, (validacion) => validacion.turno, { cascade: true })
  validaciones: ValidacionTurno[];

  @OneToMany(() => EventoTurno, (evento) => evento.turno, { cascade: true })
  historial: EventoTurno[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
