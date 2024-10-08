import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { readFileSync } from 'fs';
import { join } from 'path';

import Handlebars from 'handlebars';
import { createTransport, Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { User } from '@libs/database/entities';
import { winstonLogger } from '@libs/common/logging';
import { EmailConfig } from '@libs/common/config/interfaces/email.interface';

import { TemplatedData } from './interfaces/template-data.interface';
import { MailerTemplates } from './interfaces/template.interface';

@Injectable()
export class MailerService {
  private readonly transport: Transporter<SMTPTransport.SentMessageInfo>;
  private readonly email: string;
  private readonly domain: string;
  private readonly templates: MailerTemplates;

  constructor(private readonly configService: ConfigService) {
    const emailConfig = this.configService.get<EmailConfig>('emailService');
    this.transport = createTransport(emailConfig);
    this.email = `"My App" <${emailConfig.auth.user}>`;
    this.domain = this.configService.get<string>('domain');
    this.templates = {
      confirmation: MailerService.parseTemplate('confirmation.hbs'),
      resetPassword: MailerService.parseTemplate('reset-password.hbs'),
    };
  }

  private static parseTemplate(
    templateName: string,
  ): Handlebars.TemplateDelegate<TemplatedData> {
    const templateText = readFileSync(
      join(__dirname, 'templates', templateName),
      'utf-8',
    );
    return Handlebars.compile<TemplatedData>(templateText, { strict: true });
  }

  public sendConfirmationEmail(user: User, token: string): void {
    const { email, name } = user;
    const subject = 'Confirm your email';
    const html = this.templates.confirmation({
      name,
      link: `https://${this.domain}/auth/confirm/${token}`,
    });
    this.sendEmail(email, subject, html, 'A new confirmation email was sent.');
  }

  public sendResetPasswordEmail(user: User, token: string): void {
    const { email, name } = user;
    const subject = 'Reset your password';
    const html = this.templates.resetPassword({
      name,
      link: `https://${this.domain}/auth/reset-password/${token}`,
    });
    this.sendEmail(
      email,
      subject,
      html,
      'A new reset password email was sent.',
    );
  }

  public sendEmail(
    to: string,
    subject: string,
    html: string,
    log?: string,
  ): void {
    this.transport
      .sendMail({
        from: this.email,
        to,
        subject,
        html,
      })
      .then(() => winstonLogger?.info(log ?? 'A new email was sent.'))
      .catch((error) => winstonLogger?.error(error));
  }
}
