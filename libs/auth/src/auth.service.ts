import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import dayjs from 'dayjs';
import { hash, verify } from '@node-rs/argon2';

import { User } from '@libs/database/entities';
import { CredentialsEmbedded } from '@libs/database/embeddeds';

import { CommonService } from '@libs/common';
import { MailerService } from '@libs/mailer';
import { isNull, isUndefined } from '@libs/common/utils/validation.util';

import { JwtService } from './jwt/jwt.service';
import { TokenTypeEnum } from './jwt/enums/token-type.enum';
import { EmailToken } from './jwt/interfaces/email-token.interface';

import { UpdatePasswordInput } from './input/update-password.input';
import { ResetPasswordInput } from './input/reset-password.input';
import { SignUpInput, SignUpOutput } from './input/sign-up.input';
import { SignInInput, SignInOutput } from './input/sign-in.input';
import { ResetPasswordEmailInput } from './input/reset-password-email.input';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    private jwtService: JwtService,
    private commonService: CommonService,
    private mailerService: MailerService,
  ) {}

  async signUp(input: SignUpInput): Promise<SignUpOutput> {
    const credentials = new CredentialsEmbedded(true);

    const user = await this.repo.save(
      this.repo.create({
        ...input,
        password: await hash(input.password, {
          salt: Buffer.from(credentials.salt),
        }),
        credentials,
      }),
    );
    console.log({ user });
    const [accessToken, refreshToken] =
      await this.jwtService.generateAuthTokens(user);

    return {
      user,
      accessToken,
      refreshToken,
      expiresIn: this.jwtService.accessTime,
    };
  }

  async signIn(input: SignInInput): Promise<SignInOutput> {
    const { username, password } = input;
    const user = await this.repo.findOneOrFail({
      where: [
        {
          username,
        },
        {
          email: username,
        },
      ],
    });

    const [accessToken, refreshToken] =
      await this.jwtService.generateAuthTokens(user);

    if (
      !(await verify(user.password, password, {
        salt: Buffer.from(user.credentials.salt),
      }))
    ) {
      await this.checkLastPassword(user.credentials, password);
    }

    return {
      user,
      accessToken,
      refreshToken,
      expiresIn: this.jwtService.accessTime,
    };
  }

  public async updatePassword({ id, password }: UpdatePasswordInput) {
    const user = await this.repo.findOneBy({ id });

    if (user.password === 'UNSET') {
      // await this.createOAuthProvider(OAuthProvidersEnum.LOCAL, user.id);
    } else {
      if (isUndefined(password) || isNull(password)) {
        throw new BadRequestException('Password is required');
      }
      // if (!(await compare(password, user.password))) {
      //   throw new BadRequestException('Wrong password');
      // }
      // if (await compare(newPassword, user.password)) {
      //   throw new BadRequestException('New password must be different');
      // }
    }
    const newUser = await this.changePassword(user, password);

    const [accessToken, refreshToken] =
      await this.jwtService.generateAuthTokens(newUser);

    return {
      user: newUser,
      accessToken,
      refreshToken,
      expiresIn: this.jwtService.accessTime,
    };
  }

  public async resetPasswordEmail(input: ResetPasswordEmailInput) {
    const user = await this.repo.findOneBy({ email: input.email });

    if (!isUndefined(user) && !isNull(user)) {
      const resetToken = await this.jwtService.generateToken(
        user,
        TokenTypeEnum.RESET_PASSWORD,
      );
      this.mailerService.sendResetPasswordEmail(user, resetToken);
    }

    return user;
  }

  public async resetPassword(input: ResetPasswordInput) {
    const { id, version } = await this.jwtService.verifyToken<EmailToken>(
      input.resetToken,
      TokenTypeEnum.RESET_PASSWORD,
    );
    const user = await this.findOneByCredentials(id, version);

    return this.changePassword(user, input.password);
  }

  public async findOneByCredentials(
    id: string,
    version: number,
  ): Promise<User> {
    const user = await this.repo.findOneBy({ id });
    this.throwUnauthorizedException(user);

    if (user.credentials.version !== version) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  private async changePassword(user: User, password: string): Promise<User> {
    user.credentials.updatePassword(user.password);
    user.password = await hash(password, {
      salt: Buffer.from(user.credentials.salt),
    });

    return this.repo.save(user);
  }

  private async checkLastPassword(
    credentials: CredentialsEmbedded,
    password: string,
  ): Promise<void> {
    const { lastPassword, passwordUpdatedAt } = credentials;
    if (
      isNull(lastPassword) ||
      lastPassword.length === 0 ||
      !(await verify(password, credentials.lastPassword, {
        salt: Buffer.from(credentials.lastSalt),
      }))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const now = dayjs();
    const time = dayjs.unix(passwordUpdatedAt);
    const months = now.diff(time, 'month');
    const message = 'You changed your password ';

    if (months > 0) {
      throw new UnauthorizedException(
        message + months + (months > 1 ? ' months ago' : ' month ago'),
      );
    }

    const days = now.diff(time, 'day');

    if (days > 0) {
      throw new UnauthorizedException(
        message + days + (days > 1 ? ' days ago' : ' day ago'),
      );
    }

    const hours = now.diff(time, 'hour');

    if (hours > 0) {
      throw new UnauthorizedException(
        message + hours + (hours > 1 ? ' hours ago' : ' hour ago'),
      );
    }

    throw new UnauthorizedException(message + 'recently');
  }

  private throwUnauthorizedException(user: undefined | null | User): void {
    if (isUndefined(user) || isNull(user)) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
