import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Project } from './project.entity';
import { ProjectAction } from './project-action.entity';

@Entity('segments')
@Index(['projectId', 'segmentOrder'])
export class Segment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  projectId: string;

  @Column({ type: 'int' })
  segmentOrder: number;

  /** Narrator text spoken aloud via TTS for this segment. */
  @Column({ type: 'text' })
  narratorText: string;

  /** Edge TTS voice model, e.g. en-US-AriaNeural */
  @Column({ length: 100, default: 'en-US-AriaNeural' })
  voiceModel: string;

  @ManyToOne(() => Project, (project) => project.segments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @OneToMany(() => ProjectAction, (action) => action.segment, {
    cascade: true,
    eager: true,
  })
  actions: ProjectAction[];
}
