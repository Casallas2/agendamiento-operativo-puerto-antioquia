import {
  Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import {
  ESTADOS_VALIDACION, TIPOS_VALIDACION,
  type EstadoValidacion, type TipoValidacion,
} from 'src/common/types/dominio.type';
import { Turno } from './turno.entity';

/** Resultado de una validación documental contra un sistema externo (RF-02) */
@Entity('turno_validaciones')
@Index('IDX_VALIDACION_TURNO_TIPO', ['turnoId', 'tipo'], { unique: true })
export class ValidacionTurno {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'turno_id' })
  turnoId: string;

  @ManyToOne(() => Turno, (turno) => turno.validaciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'turno_id' })
  turno: Turno;

  @Column({ type: 'enum', enum: TIPOS_VALIDACION })
  tipo: TipoValidacion;

  @Column({ type: 'varchar', length: 80 })
  etiqueta: string;

  /** Sistema consultado a través de su adaptador, p. ej. "DIAN · SOAP/XML" */
  @Column({ type: 'varchar', length: 80 })
  fuente: string;

  @Column({ type: 'enum', enum: ESTADOS_VALIDACION, default: 'PENDIENTE' })
  estado: EstadoValidacion;

  @Column({ type: 'varchar', length: 255, nullable: true })
  mensaje: string | null;

  @Column({ type: 'int', default: 0 })
  orden: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
