import * as os from "os";

import { BaseLogger, BaseLoggerConfig } from "./base-logger";
import { extendProperties } from "./helpers/extend-properties";

import type { Log, LogEntry, LogProperties } from "./logger";

type Config = BaseLoggerConfig & {
  log: Log;
};

class SimpleLogger extends BaseLogger<Config> {
  public constructor(config: Config) {
    super(config);
  }

  doLog(level: string, entry: LogEntry, properties?: LogProperties) {
    const mergedProperties = extendProperties({ hostname: os.hostname() }, properties);

    this.config.log(level, entry, mergedProperties);
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

  child(properties?: LogProperties) {
    return new SimpleLogger({
      ...this.config,
      properties: {
        ...this.config.properties,
        ...properties,
      },
    });
  }
}

export { SimpleLogger };
