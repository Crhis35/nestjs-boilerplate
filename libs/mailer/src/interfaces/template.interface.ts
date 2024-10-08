import { TemplateDelegate } from 'handlebars';
import { TemplatedData } from './template-data.interface';

export interface MailerTemplates {
  confirmation: TemplateDelegate<TemplatedData>;
  resetPassword: TemplateDelegate<TemplatedData>;
}
