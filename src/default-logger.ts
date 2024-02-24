import os from "os";
import { JsonLogger } from "./json-logger";
import { StreamLogger } from "./stream-logger";
import { PrettyLogger } from "./pretty-logger";
import { BaseLogger, BaseLoggerConfig } from "./base-logger";
import { extendProperties } from "./helpers/extend-properties";

import type { LogEntry, Logger, LogProperties, Log } from "./logger";

type Config = BaseLoggerConfig & {
  onLog?: Log
  format?: "json" | "pretty";
  level?: "trace" | "debug" | "info" | "warn" | "error" | "fatal"
};

const FORMAT: Config["format"] = process.env.NODE_ENV === "production" ? "json" : "pretty";

const LEVEL_ORDINALS = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  fatal: 5,
};

const verifyLevel = (level: string) => {
  const levels = new Set(Object.keys(LEVEL_ORDINALS));

  if (!levels.has(level)) {
    throw new Error(`unknown log level '${level}'`);
  }
};

// pretty/json logger that logs to stdout/stderr
class DefaultLogger extends BaseLogger<Config> {
  private readonly stdoutLogger: Logger;
  private readonly stderrLogger: Logger;

  public constructor(config: Config = {}) {
    super({
      ...config,
      properties: extendProperties({ hostname: os.hostname() }, config.properties),
      levelsOrdinals: LEVEL_ORDINALS,
    });

    this.stdoutLogger = this.createStdoutLogger();
    this.stderrLogger = this.createStderrLogger();

    verifyLevel(this.level);
  }

  private createStdoutLogger() {
    const format = this.config.format ?? FORMAT;

    if (format === "json") {
      return new JsonLogger({
        properties: {
          get timestamp() {
            return new Date().toISOString();
          },
        },
        delegate: new StreamLogger({
          stream: process.stdout,
        }),
      });
    }

    if (format === "pretty") {
      return new PrettyLogger({
        delegate: new StreamLogger({
          stream: process.stdout,
        }),
      });
    }

    throw new Error(`unknown logger format '${format}'`);
  }

  private createStderrLogger() {
    const format = this.config.format ?? FORMAT;

    if (format === "json") {
      return new JsonLogger({
        properties: {
          get timestamp() {
            return new Date().toISOString();
          },
        },
        delegate: new StreamLogger({
          stream: process.stderr,
        }),
      });
    }

    if (format === "pretty") {
      return new PrettyLogger({
        delegate: new StreamLogger({
          stream: process.stderr,
        }),
      });
    }

    throw new Error(`unknown logger format '${format}'`);
  }

  fatal(entry: LogEntry, properties?: LogProperties) {
    this.log("fatal", entry, properties);
  }

  error(entry: LogEntry, properties?: LogProperties) {
    this.log("error", entry, properties);
  }

  warn(entry: LogEntry, properties?: LogProperties) {
    this.log("warn", entry, properties);
  }

  info(entry: LogEntry, properties?: LogProperties) {
    this.log("info", entry, properties);
  }

  debug(entry: LogEntry, properties?: LogProperties) {
    this.log("debug", entry, properties);
  }

  trace(entry: LogEntry, properties?: LogProperties) {
    this.log("trace", entry, properties);
  }

  doLog(level: string, entry: LogEntry, properties?: LogProperties) {
    const ordinal = this.levelsOrdinals[level];
    const errorOrdinal = this.levelsOrdinals.error;

    if (ordinal >= errorOrdinal) {
      this.stderrLogger.log(level, entry, properties);
    }
    else {
      this.stdoutLogger.log(level, entry, properties);
    }
  }

  child(properties?: LogProperties) {
    return new DefaultLogger({
      format: this.config.format,
      properties: {
        ...this.config.properties,
        ...properties,
      },
    });
  }
}

export { DefaultLogger };
