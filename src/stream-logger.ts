import { LogEntry, LogProperties } from "./logger";
import { BaseLogger, BaseLoggerConfig } from "./base-logger";

type Config = BaseLoggerConfig & {
  stream: NodeJS.WritableStream;
};

// This logger writes an entry to the provided stream
// and assumes that the entry is a string
// Backpressure should be handled by the provided stream (??)
class StreamLogger extends BaseLogger<Config> {
  public constructor(config: Config) {
    super(config);
  }

  doLog(level: string, entry: LogEntry, properties?: LogProperties): void {
    this.config.stream.write(entry.toString());
  }

  child(properties?: LogProperties) {
    return new StreamLogger({
      ...this.config,
      properties: {
        ...this.config.properties,
        ...properties,
      },
    });
  }
}

export { StreamLogger };
