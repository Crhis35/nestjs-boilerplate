import { existsSync, mkdirSync } from 'fs';
import { Logger } from 'winston';

import winstonDaily = require('winston-daily-rotate-file');
import winston = require('winston');

const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

// Define log format
const logFormat = winston.format.printf(
  ({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`,
);

export let winstonLogger: Logger | undefined = undefined;

export const initWinston = (apiTitle: string) => {
  // logs dir
  const logDir = './logs';

  if (!existsSync(logDir)) {
    mkdirSync(logDir);
  }
  const logger = winston.createLogger({
    level: 'debug',
    levels: logLevels,
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      logFormat,
    ),
    defaultMeta: { service: apiTitle },
    transports: [
      // debug log setting
      new winstonDaily({
        level: 'debug',
        datePattern: 'YYYY-MM-DD',
        dirname: logDir + '/debug', // log file /logs/debug/*.log in save
        filename: `%DATE%.log`,
        maxFiles: 30, // 30 Days saved
        json: false,
        zippedArchive: true,
      }),
      // error log setting
      new winstonDaily({
        level: 'error',
        datePattern: 'YYYY-MM-DD',
        dirname: logDir + '/error', // log file /logs/error/*.log in save
        filename: `%DATE%.log`,
        maxFiles: 30, // 30 Days saved
        handleExceptions: true,
        json: false,
        zippedArchive: true,
      }),
    ],
    exceptionHandlers: [
      new winston.transports.Console({
        format: winston.format.simple(),
      }),
      new winston.transports.File({ filename: 'logs/exceptions.log' }),
    ],
    rejectionHandlers: [
      new winston.transports.Console({
        format: winston.format.simple(),
      }),
      new winston.transports.File({ filename: 'logs/rejections.log' }),
    ],
  });

  if (process.env.NODE_ENV !== 'production') {
    logger.add(
      new winston.transports.Console({
        format: winston.format.simple(),
      }),
    );
  }
  winstonLogger = logger;
};
