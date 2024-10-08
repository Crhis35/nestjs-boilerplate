import { EmailConfig } from './email.interface';
import { JWT } from './jwt.interface';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export interface BaseConfiguration {
  readonly id: string;
  readonly url: string;
  readonly port: number;
  readonly domain: string;
  readonly db: TypeOrmModuleOptions;
  readonly jwt: JWT;
  readonly emailService: EmailConfig;
}
