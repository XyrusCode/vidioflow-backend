import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Project } from './project.entity';

@Entity('scripts')
export class Script {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id', type: 'uuid', unique: true })
  projectId: string;

  @Column({ name: 'text_content', type: 'text' })
  textContent: string;

  @Column({ name: 'voice_model', type: 'varchar', length: 100, default: 'en-US-AriaNeural' })
  voiceModel: string;

  @OneToOne(() => Project, (project) => project.script, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;
}
