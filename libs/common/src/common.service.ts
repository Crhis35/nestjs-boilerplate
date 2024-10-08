import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import slugify from 'slugify';

import { isNull, isUndefined } from './utils/validation.util';
import { winstonLogger } from './logging';

@Injectable()
export class CommonService {
  /**
   * Validate Entity
   *
   * Validates an entities with the class-validator library
   */
  public async validateEntity<T>(entity: T): Promise<void> {
    const errors = await validate(entity as object);
    const messages: string[] = [];

    for (const error of errors) {
      messages.push(...Object.values(error.constraints));
    }

    if (errors.length > 0) {
      throw new BadRequestException(messages.join(',\n'));
    }
  }

  /**
   * Check Entity Existence
   *
   * Checks if a findOne query didn't return null or undefined
   */
  public checkEntityExistence<T>(
    entity: T | null | undefined,
    name: string,
  ): void {
    if (isNull(entity) || isUndefined(entity)) {
      throw new NotFoundException(`${name} not found`);
    }
  }

  /**
   * Throw Duplicate Error
   *
   * Checks if an error is of the code 23505, PostgreSQL's duplicate value error,
   * and throws a conflict exception
   */
  public async throwDuplicateError<T>(
    promise: Promise<T>,
    message?: string,
  ): Promise<T> {
    try {
      return await promise;
    } catch (error) {
      winstonLogger?.error(error);

      if (error.code === '23505') {
        throw new ConflictException(message ?? 'Duplicated value in database');
      }

      throw new BadRequestException(error.message);
    }
  }

  /**
   * Throw Internal Error
   *
   * Function to abstract throwing internal server exception
   */
  public async throwInternalError<T>(promise: Promise<T>): Promise<T> {
    try {
      return await promise;
    } catch (error) {
      winstonLogger?.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Throw Unauthorized
   *
   * Function to abstract throwing unauthorized exception
   */
  public async throwUnauthorizedError<T>(promise: Promise<T>): Promise<T> {
    try {
      return await promise;
    } catch (error) {
      winstonLogger?.error(error);
      throw new UnauthorizedException();
    }
  }

  /**
   * Format Name
   *
   * Takes a string, trims it, and capitalizes every word
   */
  public formatName(title: string): string {
    return title
      .trim()
      .replace(/\n/g, ' ')
      .replace(/\s\s+/g, ' ')
      .replace(/\w\S*/g, (w) => w.replace(/^\w/, (l) => l.toUpperCase()));
  }

  /**
   * Generate Point Slug
   *
   * Takes a string and generates a slug with dots as word separators
   */
  public generatePointSlug(str: string): string {
    return slugify(str, { lower: true, replacement: '.', remove: /['_\.\-]/g });
  }
}
