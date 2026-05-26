import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Segment } from './segment.entity';

export enum ActionType {
  NAVIGATE = 'navigate',
  CLICK = 'click',
  FILL = 'fill',
  SELECT = 'select',
  WAIT = 'wait',
  SCROLL = 'scroll',
  HOVER = 'hover',
  PRESS = 'press',
  WAIT_FOR_SELECTOR = 'waitForSelector',
}

@Entity('project_actions')
@Index(['segmentId', 'actionOrder'])
export class ProjectAction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  segmentId: string;

  @Column({ type: 'int' })
  actionOrder: number;

  @Column({ type: 'enum', enum: ActionType })
  actionType: ActionType;

  /** CSS selector / XPath — required for click, fill, select, hover, waitForSelector */
  // explicit type: 'varchar' required — reflect-metadata stores `string | null`
  // union types as `Object` at runtime, which TypeORM can't map to a pg column.
  @Column({ type: 'varchar', length: 500, nullable: true })
  selector: string | null;

  /**
   * Action-specific value:
   *   navigate  → URL
   *   fill      → text to type
   *   select    → option value
   *   wait      → milliseconds as string
   *   scroll    → "scrollY" or "x,y" (window) / omit for scrollIntoView
   *   press     → key name, e.g. "Enter"
   *   waitForSelector → state: visible | hidden | attached | detached
   */
  @Column({ type: 'text', nullable: true })
  value: string | null;

  @ManyToOne(() => Segment, (segment) => segment.actions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'segmentId' })
  segment: Segment;
}
