import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

/**
 * Parameter-level pipe that validates an incoming request body against a Zod
 * schema. On failure it throws a 400 BadRequestException whose `message`
 * array mirrors the shape returned by NestJS's built-in ValidationPipe so
 * existing frontend error-handling logic works unchanged.
 *
 * Usage:
 *   @Post()
 *   create(@Body(new ZodValidationPipe(MySchema)) dto: MyDto) { ... }
 */
export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const issues = (result.error as ZodError).errors;
      const messages = issues.map((issue) => {
        const field = issue.path.length ? issue.path.join('.') + ': ' : '';
        return `${field}${issue.message}`;
      });
      throw new BadRequestException({
        statusCode: 400,
        message: messages,
        error: 'Validation failed',
      });
    }
    return result.data;
  }
}
