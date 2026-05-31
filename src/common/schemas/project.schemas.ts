// All project schemas are defined in @xyruscode/central and re-exported here
// so NestJS modules import from this predictable local path.
export {
  CreateProjectSchema,
  CreateActionSchema,
  CreateSegmentSchema,
} from '@xyruscode/central';

export type { CreateProjectInput } from '@xyruscode/central';
