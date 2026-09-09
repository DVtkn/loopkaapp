export class DatabaseUnavailableError extends Error {
  statusCode = 503;
  status = 503;
  code = "DB_UNAVAILABLE";

  constructor(message = "Сервис временно недоступен, попробуйте через минуту") {
    super(message);
    this.name = "DatabaseUnavailableError";
    Object.setPrototypeOf(this, DatabaseUnavailableError.prototype);
  }
}

export function isDatabaseError(err: any): boolean {
  if (!err) return false;
  if (err instanceof DatabaseUnavailableError || err.code === "DB_UNAVAILABLE" || err.status === 503 || err.statusCode === 503) {
    return true;
  }
  const msg = String(err.message || "");
  const code = String(err.code || "");
  if (
    code === "ECONNREFUSED" ||
    code === "ETIMEDOUT" ||
    code === "ENOTFOUND" ||
    code === "57P01" || // admin_shutdown
    code === "08001" || // sqlclient_unable_to_establish_sqlconnection
    code === "08006" || // connection_failure
    code === "08003" || // connection_does_not_exist
    msg.includes("fetch failed") ||
    msg.includes("connection timeout") ||
    msg.includes("connect ECONNREFUSED") ||
    msg.includes("NeonDbError") ||
    msg.includes("WebSocket connection") ||
    msg.includes("Error connecting to database")
  ) {
    return true;
  }
  return false;
}
