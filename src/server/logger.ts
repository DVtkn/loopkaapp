export type LogLevel = 'info' | 'warn' | 'error' | 'security';

export interface LogPayload {
  message: string;
  level: LogLevel;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
}

function formatLog(level: LogLevel, message: string, context?: Record<string, unknown>, err?: unknown): string {
  const timestamp = new Date().toISOString();
  let errorObj: { message: string; stack?: string; name?: string } | undefined;

  if (err instanceof Error) {
    errorObj = {
      name: err.name,
      message: err.message,
      stack: err.stack,
    };
  } else if (err && typeof err === 'object') {
    errorObj = { message: JSON.stringify(err) };
  } else if (err) {
    errorObj = { message: String(err) };
  }

  const payload: LogPayload = {
    level,
    message,
    timestamp,
    ...(context ? { context } : {}),
    ...(errorObj ? { error: errorObj } : {}),
  };

  const prefix = `[${level.toUpperCase()}] ${timestamp} - ${message}`;
  const details = context || errorObj ? ` | ${JSON.stringify({ ...(context || {}), ...(errorObj ? { error: errorObj } : {}) })}` : '';
  return `${prefix}${details}`;
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    console.log(formatLog('info', message, context));
  },
  warn: (message: string, context?: Record<string, unknown>, err?: unknown) => {
    console.warn(formatLog('warn', message, context, err));
  },
  error: (message: string, err?: unknown, context?: Record<string, unknown>) => {
    console.error(formatLog('error', message, context, err));
  },
  security: (message: string, context?: Record<string, unknown>) => {
    console.error(formatLog('security', message, context));
  },
};
