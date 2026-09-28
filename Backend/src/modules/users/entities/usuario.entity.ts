import {
  Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { ROLES_USUARIO, type RolUsuario } from 'src/common/types/dominio.type';
import { Conductor, Empresa } from 'src/modules/flota/entities';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Index('IDX_USUARIO_CORREO', { unique: true })
  @Column({ type: 'varchar', length: 255 })
  correo: string;

  /** Nunca se selecciona por defecto: evita que la contraseña salga en cualquier consulta */
  @Column({ type: 'varchar', length: 255, name: 'password_hash', select: false })
  passwordHash: string;

  @Index('IDX_USUARIO_ROL')
  @Column({ type: 'enum', enum: ROLES_USUARIO })
  rol: RolUsuario;

  @Column({ type: 'varchar', length: 30 })
  telefono: string;

  @Column({ type: 'uuid', name: 'empresa_id', nullable: true })
  empresaId: string | null;

  @ManyToOne(() => Empresa, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa | null;

  /** Nombre comercial mostrado en la interfaz (el puerto no es una empresa transportadora) */
  @Column({ type: 'varchar', length: 150, name: 'empresa_nombre', nullable: true })
  empresaNombre: string | null;

  /** Solo para el rol CONDUCTOR: vincula la cuenta con su ficha de conductor */
  @Column({ type: 'uuid', name: 'conductor_id', nullable: true })
  conductorId: string | null;

  @ManyToOne(() => Conductor, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'conductor_id' })
  conductor: Conductor | null;

  @Index('IDX_USUARIO_ACTIVO')
  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
