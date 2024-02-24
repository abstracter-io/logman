import { StreamLogger } from "./stream-logger";
import { BaseLogger, BaseLoggerConfig } from "./base-logger";

import type { LogEntry, Logger, LogProperties } from "./logger";

type Config = BaseLoggerConfig & {
  delegate?: Logger;
};

class JsonLogger extends BaseLogger<Config> {
  private readonly delegate: Logger;

  public constructor(config: Config = {}) {
    super(config);

    this.delegate = config.delegate ?? new StreamLogger({
      level: config.level,
      stream: process.stdout,
      levelsOrdinals: config.levelsOrdinals,
    });
  }

  doLog(level: string, entry: LogEntry, properties?: LogProperties) {
    const json = JSON.stringify({
      ...properties,
      level,
      message: entry.toString(),
    });

    this.delegate.log(level, `${json}\n`, properties);
  }

  child(properties?: LogProperties) {
    return new JsonLogger({
      ...this.config,
      delegate: this.delegate,
      properties: {
        ...this.config.properties,
        ...properties,
      },
    });
  }
}

export { JsonLogger };
