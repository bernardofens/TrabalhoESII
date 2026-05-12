import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  // Aqui nós dizemos para o TypeORM que a coluna é do tipo 'varchar'
  @Column({ type: 'varchar', nullable: true })
  hashedRefreshToken: string | null;

  @Column({ default: 'vendedor' })
  role: string;

  @Column({ default: true })
  isActive: boolean;
}