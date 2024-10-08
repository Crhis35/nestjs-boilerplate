interface EmailAuth {
  user: string;
  pass: string;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: EmailAuth;
}
