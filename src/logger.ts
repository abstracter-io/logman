type LogProperties = Record<string, unknown>;

type LogEntry = string | Error;

type Log = (level: string, entry: LogEntry, properties?: LogProperties) => void;

interface Logger {
  log: Log;
  child: (properties?: LogProperties) => Logger;
}

export type { Logger, Log, LogEntry, LogProperties };
