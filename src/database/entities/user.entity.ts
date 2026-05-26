import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Project } from './project.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true, length: 100 })
  name: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Project, (project) => project.user, { cascade: true })
  projects: Project[];
}
