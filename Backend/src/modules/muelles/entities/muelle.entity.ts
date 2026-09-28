import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ESTADOS_MUELLE, type EstadoMuelle } from 'src/common/types/dominio.type';

@Entity('muelles')
export class Muelle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 80 })
  nombre: string;

  @Column({ type: 'varchar', length: 80, name: 'tipo_carga' })
  tipoCarga: string;

  @Index('IDX_MUELLE_ESTADO')
  @Column({ type: 'enum', enum: ESTADOS_MUELLE, default: 'OPERATIVO' })
  estado: EstadoMuelle;

  @Column({ type: 'int', default: 0, name: 'retraso_minutos' })
  retrasoMinutos: number;

  @Column({ type: 'varchar', length: 255, name: 'motivo_novedad', nullable: true })
  motivoNovedad: string | null;

  @Column({ type: 'int', name: 'capacidad_por_franja' })
  capacidadPorFranja: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
