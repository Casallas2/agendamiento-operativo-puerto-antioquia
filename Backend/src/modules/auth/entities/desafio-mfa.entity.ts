import {
  Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { Usuario } from 'src/modules/users/entities';

/** Desafío de segundo factor pendiente de verificación (RNF-02) */
@Entity('desafios_mfa')
export class DesafioMfa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('IDX_DESAFIO_USUARIO')
  @Column({ type: 'uuid', name: 'usuario_id' })
  usuarioId: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ type: 'int', default: 0 })
  intentos: number;

  @Column({ type: 'timestamptz', name: 'expira_en' })
  expiraEn: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
