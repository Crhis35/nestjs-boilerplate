import { Column } from 'typeorm';

import dayjs from 'dayjs';
import { randomUUID } from 'crypto';

export class CredentialsEmbedded {
  @Column({ type: 'int' })
  version: number = 0;

  @Column({ nullable: true })
  lastPassword?: string;

  @Column({ nullable: true })
  lastSalt?: string;

  @Column({ nullable: true })
  salt?: string;

  @Column({ default: dayjs().unix() })
  passwordUpdatedAt: number = dayjs().unix();

  @Column({ default: dayjs().unix() })
  updatedAt: number = dayjs().unix();

  constructor(isConfirmed = false) {
    this.version = isConfirmed ? 1 : 0;
    this.salt = randomUUID();
  }

  updatePassword(password: string): void {
    this.version++;
    this.lastPassword = password;
    const now = dayjs().unix();
    this.passwordUpdatedAt = now;
    this.updatedAt = now;
    this.lastSalt = this.salt;
    this.salt = randomUUID();
  }

  updateVersion(): void {
    this.version++;
    this.updatedAt = dayjs().unix();
  }
}
