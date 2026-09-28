import {
  Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { Turno } from './turno.entity';

/** Línea de tiempo del turno: cada cambio relevante queda registrado (trazabilidad) */
@Entity('turno_eventos')
export class EventoTurno {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('IDX_EVENTO_TURNO')
  @Column({ type: 'uuid', name: 'turno_id' })
  turnoId: string;

  @ManyToOne(() => Turno, (turno) => turno.historial, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'turno_id' })
  turno: Turno;

  @Column({ type: 'varchar', length: 50 })
  tipo: string;

  @Column({ type: 'varchar', length: 255 })
  descripcion: string;

  @Column({ type: 'timestamptz', name: 'ocurrido_en' })
  ocurridoEn: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
