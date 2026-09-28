import {
  Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { Muelle } from 'src/modules/muelles/entities';

/** Ventana de tiempo reservable en un muelle (slot) */
@Entity('franjas')
@Index('IDX_FRANJA_MUELLE_INICIO', ['muelleId', 'inicio'])
export class Franja {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'muelle_id' })
  muelleId: string;

  @ManyToOne(() => Muelle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'muelle_id' })
  muelle: Muelle;

  @Index('IDX_FRANJA_INICIO')
  @Column({ type: 'timestamptz' })
  inicio: Date;

  @Column({ type: 'timestamptz' })
  fin: Date;

  @Column({ type: 'int' })
  capacidad: number;

  @Column({ type: 'int', default: 0 })
  ocupados: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
