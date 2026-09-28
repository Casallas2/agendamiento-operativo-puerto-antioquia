import {
  Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { ESTADOS_RUNT, type EstadoRunt } from 'src/common/types/dominio.type';
import { Empresa } from './empresa.entity';

@Entity('vehiculos')
export class Vehiculo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('IDX_VEHICULO_PLACA', { unique: true })
  @Column({ type: 'varchar', length: 10 })
  placa: string;

  @Column({ type: 'varchar', length: 80 })
  tipo: string;

  @Column({ type: 'varchar', length: 80 })
  marca: string;

  @Index('IDX_VEHICULO_EMPRESA')
  @Column({ type: 'uuid', name: 'empresa_id' })
  empresaId: string;

  @ManyToOne(() => Empresa, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ type: 'enum', enum: ESTADOS_RUNT, default: 'ACTIVO', name: 'estado_runt' })
  estadoRunt: EstadoRunt;

  @Column({ type: 'timestamptz', name: 'vencimiento_soat' })
  vencimientoSoat: Date;

  @Column({ type: 'timestamptz', name: 'vencimiento_tecnomecanica' })
  vencimientoTecnomecanica: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
