// backend/src/utils/logger.js
import { randomUUID } from 'crypto';
import winston from 'winston';

const { combine, timestamp, printf, splat, errors } = winston.format;

const consoleFormat = printf((info) => {
  const { level, message, timestamp, requestId, stack, service, ...metadata } = info;

  const base = {
    timestamp,
    level,
    message,
    ...(service ? { service } : {}),
    ...(requestId ? { requestId } : {}),
    ...(stack ? { stack } : {})
  };

  if (metadata.error instanceof Error) {
    base.error = {
      message: metadata.error.message,
      stack: metadata.error.stack
    };
    delete metadata.error;
  } else if (metadata.error) {
    base.error = metadata.error;
    delete metadata.error;
  }

  if (Object.keys(metadata).length) {
    base.metadata = metadata;
  }

  return JSON.stringify(base);
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: winston.config.npm.levels,
  format: combine(errors({ stack: true }), splat(), timestamp()),
  defaultMeta: {
    service: 'richwell-backend'
  },
  transports: [
    new winston.transports.Console({
      format: combine(errors({ stack: true }), splat(), timestamp(), consoleFormat)
    })
  ]
});

export const attachRequestLogger = (req, res, next) => {
  const requestId = randomUUID();
  const startTime = process.hrtime.bigint();

  req.requestId = requestId;
  req.log = logger.child({ requestId });
  res.locals.requestId = requestId;

  req.log.info('Incoming request', {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip
  });

  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1_000_000;

    req.log.info('Completed request', {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2))
    });
  });

  next();
};

export default logger;
