import {
  Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { TIPOS_NOTIFICACION, type CanalNotificacion, type TipoNotificacion } from 'src/common/types/dominio.type';
import { Usuario } from 'src/modules/users/entities';

@Entity('notificaciones')
@Index('IDX_NOTIFICACION_USUARIO_FECHA', ['usuarioId', 'creadaEn'])
export class Notificacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'usuario_id' })
  usuarioId: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ type: 'varchar', length: 150 })
  titulo: string;

  @Column({ type: 'varchar', length: 500 })
  mensaje: string;

  @Column({ type: 'enum', enum: TIPOS_NOTIFICACION, default: 'INFO' })
  tipo: TipoNotificacion;

  /** Canales por los que el despachador entregó el aviso (Push, SMS, Voz) */
  @Column({ type: 'text', array: true, default: () => "'{}'" })
  canales: CanalNotificacion[];

  @Column({ type: 'uuid', name: 'turno_id', nullable: true })
  turnoId: string | null;

  @Column({ type: 'boolean', default: false })
  leida: boolean;

  @Column({ type: 'timestamptz', name: 'creada_en' })
  creadaEn: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
