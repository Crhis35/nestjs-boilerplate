import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { randomUUID } from 'crypto';
import { jwtVerify, SignJWT, errors, JWTPayload } from 'jose';

import { CommonService } from '@libs/common';

import { TokenTypeEnum } from './enums/token-type.enum';
import { AccessToken } from './interfaces/access-token.interface';
import { EmailToken } from './interfaces/email-token.interface';
import { RefreshToken } from './interfaces/refresh-token.interface';
import { JWT } from '@libs/common/config/interfaces/jwt.interface';
import { User } from '@libs/database/entities';

@Injectable()
export class JwtService {
  private readonly jwtConfig: JWT;
  private readonly issuer: string;
  private readonly domain: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly commonService: CommonService,
  ) {
    this.jwtConfig = this.configService.get<JWT>('jwt');
    this.issuer = this.configService.get<string>('id');
    this.domain = this.configService.get<string>('domain');
  }

  public get accessTime(): number {
    return this.jwtConfig.access.time;
  }

  private async generateTokenAsync(
    payload: JWTPayload,
    secret: string,
    options: { expiresIn: string | number },
  ): Promise<string> {
    const algorithm = 'HS256'; // Default is HMAC SHA-256 for HS256
    const jti = randomUUID(); // Generate a unique ID for the JWT

    return new SignJWT(payload)
      .setProtectedHeader({ alg: algorithm })
      .setIssuer(this.issuer)
      .setAudience(this.domain)
      .setSubject(payload['sub'])
      .setJti(jti)
      .setExpirationTime(options.expiresIn)
      .sign(new TextEncoder().encode(secret));
  }

  private async verifyTokenAsync<T>(
    token: string,
    secret: string,
    options: { maxAge: string | number },
  ): Promise<T> {
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(secret),
        {
          issuer: this.issuer,
          audience: this.domain,
          maxTokenAge: `${options.maxAge}s`,
        },
      );
      return payload as T;
    } catch (error) {
      throw error;
    }
  }

  private static async throwBadRequest<
    T extends AccessToken | RefreshToken | EmailToken,
  >(promise: Promise<T>): Promise<T> {
    try {
      return await promise;
    } catch (error) {
      if (error instanceof errors.JWTExpired) {
        throw new BadRequestException('Token expired');
      }
      if (error instanceof errors.JWTClaimValidationFailed) {
        throw new BadRequestException('Invalid token');
      }
      throw new InternalServerErrorException(error);
    }
  }

  public async generateToken(
    user: User,
    tokenType: TokenTypeEnum,
    domain?: string | null,
    tokenId?: string,
  ): Promise<string> {
    const jwtOptions = {
      expiresIn: undefined,
      audience: domain ?? this.domain,
    };

    switch (tokenType) {
      case TokenTypeEnum.ACCESS:
        const { privateKey, time: accessTime } = this.jwtConfig.access;
        jwtOptions.expiresIn = accessTime;
        return this.commonService.throwInternalError(
          this.generateTokenAsync(
            {
              sub: user.id,
              email: user.email,
              version: user.credentials.version,
            },
            privateKey,
            jwtOptions,
          ),
        );
      case TokenTypeEnum.REFRESH:
        const { secret: refreshSecret, time: refreshTime } =
          this.jwtConfig.refresh;
        jwtOptions.expiresIn = refreshTime;
        return this.commonService.throwInternalError(
          this.generateTokenAsync(
            {
              sub: user.id,
              version: user.credentials.version,
              tokenId: tokenId ?? randomUUID(),
            },
            refreshSecret,
            jwtOptions,
          ),
        );
      case TokenTypeEnum.CONFIRMATION:
      case TokenTypeEnum.RESET_PASSWORD:
        const { secret, time } = this.jwtConfig[tokenType];
        jwtOptions.expiresIn = time;
        return this.commonService.throwInternalError(
          this.generateTokenAsync(
            { sub: user.id, version: user.credentials.version },
            secret,
            jwtOptions,
          ),
        );
    }
  }

  public async verifyToken<T extends AccessToken | RefreshToken | EmailToken>(
    token: string,
    tokenType: TokenTypeEnum,
  ): Promise<T> {
    const jwtOptions = {
      maxAge: undefined,
      audience: new RegExp(this.domain),
    };

    switch (tokenType) {
      case TokenTypeEnum.ACCESS:
        const { publicKey, time: accessTime } = this.jwtConfig.access;
        jwtOptions.maxAge = accessTime;
        return JwtService.throwBadRequest(
          this.verifyTokenAsync(token, publicKey, jwtOptions),
        );
      case TokenTypeEnum.REFRESH:
      case TokenTypeEnum.CONFIRMATION:
      case TokenTypeEnum.RESET_PASSWORD:
        const { secret, time } = this.jwtConfig[tokenType];
        jwtOptions.maxAge = time;
        return JwtService.throwBadRequest(
          this.verifyTokenAsync(token, secret, jwtOptions),
        );
    }
  }

  public async generateAuthTokens(
    user: User,
    domain?: string,
    tokenId?: string,
  ): Promise<[string, string]> {
    return Promise.all([
      this.generateToken(user, TokenTypeEnum.ACCESS, domain, tokenId),
      this.generateToken(user, TokenTypeEnum.REFRESH, domain, tokenId),
    ]);
  }
}
