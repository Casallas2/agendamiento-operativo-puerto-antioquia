import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** Serie histórica del tiempo de espera en vía, base del indicador de reducción (RNF-03) */
@Entity('historial_espera')
export class PuntoEspera {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('IDX_ESPERA_FECHA', { unique: true })
  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'int' })
  minutos: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
