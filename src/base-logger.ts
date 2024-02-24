import { extendProperties } from "./helpers/extend-properties";

import type { LogEntry, Logger, LogProperties } from "./logger";

type LevelOrdinals = { [k: string]: number };

type Config = {
  level?: string;
  properties?: LogProperties;

  // A log level ordinal is used to
  // determine if a log entry is >= to the logger level
  // aka "minimum" log level.
  // For example { info: 2, warn: 3 }
  // when a logger level is "info", and a log entry is "warn"
  // the entry will be logged, since "warn" (3) is >= to "info" (2)
  levelsOrdinals?: LevelOrdinals;
};

const DEFAULT_ORDINALS = {};

const assertLevels = (ordinals: LevelOrdinals, loggerLevel: string, entryLevel: string) => {
  const min = ordinals[loggerLevel] ?? 0;
  const value = ordinals[entryLevel] ?? 0;

  if (min === undefined || value === undefined) {
    return true;
  }

  return value >= min;
};

abstract class BaseLogger<T extends Config = never> implements Logger {
  protected readonly level: string;
  protected readonly levelsOrdinals: LevelOrdinals;
  protected readonly config: T;

  protected constructor(config: T = {} as T) {
    this.level = config.level ?? process.env.LOGMAN_LOG_LEVEL ?? "info";
    this.levelsOrdinals = config.levelsOrdinals ?? DEFAULT_ORDINALS;
    this.config = {
      levelsOrdinals: DEFAULT_ORDINALS,
      properties: Object.create(null),
      ...config,
    };
  }

  public abstract child(properties?: LogProperties): Logger;

  protected abstract doLog(level: string, entry: LogEntry, properties?: LogProperties): void;

  log(level: string, entry: LogEntry, properties?: LogProperties) {
    if (assertLevels(this.levelsOrdinals, this.level, level)) {
      const mergedProperties = extendProperties({}, this.config.properties, properties);

      this.doLog(level, entry, mergedProperties);
    }
  }
}

export { BaseLogger };

export type BaseLoggerConfig = Config;
