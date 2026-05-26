import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { ProjectStatus } from '../../common/enums/project-status.enum';
import { AutomationStep } from './automation-step.entity';
import { Script } from './script.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.PENDING,
  })
  status: ProjectStatus;

  @Column({ name: 'final_video_url', type: 'varchar', length: 500, nullable: true })
  finalVideoUrl: string;

  @OneToMany(() => AutomationStep, (step) => step.project, {
    cascade: true,
    eager: false,
  })
  steps: AutomationStep[];

  @OneToOne(() => Script, (script) => script.project, {
    cascade: true,
    eager: false,
  })
  script: Script;
}
