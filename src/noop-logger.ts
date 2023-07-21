import type { LogEntry, Logger, LogProperties } from "./logger";

class NoopLogger implements Logger {
  log(level: string, entry: LogEntry, properties?: LogProperties) {
    return undefined;
  }

  child(properties?: LogProperties) {
    return this;
  }
}

export { NoopLogger };
