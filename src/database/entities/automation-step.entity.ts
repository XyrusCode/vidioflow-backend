import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ActionType } from '../../common/enums/action-type.enum';
import { Project } from './project.entity';

@Entity('automation_steps')
@Index(['projectId', 'stepOrder'])
export class AutomationStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @Column({ name: 'step_order', type: 'int' })
  stepOrder: number;

  @Column({
    name: 'action_type',
    type: 'enum',
    enum: ActionType,
  })
  actionType: ActionType;

  @Column({ type: 'varchar', length: 500, nullable: true })
  selector: string;

  @Column({ type: 'text', nullable: true })
  value: string;

  @ManyToOne(() => Project, (project) => project.steps, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;
}
