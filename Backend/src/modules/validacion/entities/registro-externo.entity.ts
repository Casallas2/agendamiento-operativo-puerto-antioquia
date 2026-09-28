import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { SISTEMAS_EXTERNOS, type SistemaExterno } from 'src/common/types/dominio.type';

/**
 * Espejo local de los registros que viven en los sistemas externos (manifiestos DIAN y BL
 * del operador portuario). Reason: el prototipo no puede consultar los servicios reales,
 * así que los adaptadores resuelven contra esta tabla sin que el servicio de validación
 * se entere de la diferencia.
 */
@Entity('registros_externos')
@Index('IDX_REGISTRO_SISTEMA_NUMERO', ['sistema', 'numero'], { unique: true })
export class RegistroExterno {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: SISTEMAS_EXTERNOS })
  sistema: SistemaExterno;

  @Column({ type: 'varchar', length: 40 })
  numero: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
