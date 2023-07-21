import colors from "colors/safe";
import SonicBoom from "sonic-boom";

import { StreamLogger } from "./stream-logger";
import { BaseLogger, BaseLoggerConfig } from "./base-logger";

import type { LogEntry, Logger, LogProperties } from "./logger";

type Color = (str: string) => string;

type Config = BaseLoggerConfig & {
  delegate?: Logger;
  disableColors?: boolean;
};

const LEVEL_COLOR: Record<string, Color | undefined> = {
  fatal: colors.red,
  error: colors.red,
  warn: colors.yellow,
  info: colors.green,
  debug: colors.blue,
  trace: colors.blue,
};

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  fractionalSecondDigits: 3,
  hour12: false,
});

const dateParts = (date: Date) => {
  const obj: Record<string, string> = {};
  const parts = DATE_TIME_FORMAT.formatToParts(date);

  for (const part of parts) {
    obj[part.type] = part.value;
  }

  return obj;
};

const formatDate = (date: Date = new Date()) => {
  const parts = dateParts(date);
  const time = `${parts.hour}:${parts.minute}:${parts.second}.${parts.fractionalSecond}`;

  return `${parts.year}-${parts.month}-${parts.day} ${time}`;
};

class PrettyLogger extends BaseLogger<Config> {
  private readonly delegate: Logger;

  public constructor(config: Config = {}) {
    super(config);

    this.delegate = config.delegate ?? new StreamLogger({
      level: config.level,
      levelsOrdinals: config.levelsOrdinals,
      // @ts-expect-error partial stream
      stream: new SonicBoom({ fd: process.stdout.fd }),
    });
  }

  private color(color: Color, str: string): string {
    if (this.config.disableColors) {
      return str;
    }

    return color(str);
  }

  private formatLevel(level: string): string {
    if (!this.config.disableColors) {
      const levelColor = LEVEL_COLOR[level];

      if (levelColor) {
        return levelColor(level.toUpperCase());
      }
    }

    return level.toUpperCase();
  }

  private formatError(entry: LogEntry): string | null {
    if (entry instanceof Error && entry.stack) {
      return entry.stack;
    }

    return null;
  }

  private formatMessage(level: string, entry: LogEntry, properties?: LogProperties): string {
    const { name, ...props } = properties ?? {};
    const message = entry instanceof Error ? entry.message : entry;
    const datetime = formatDate(new Date());

    let line = `${this.color(colors.grey, datetime)}`;

    for (const [key, value] of Object.entries(props)) {
      const prop = `[${key}: ${typeof value === "string" ? value : "*"}]`;

      line += ` ${this.color(colors.grey, prop)}`;
    }

    line += ` ${this.formatLevel(level)}`;

    if (typeof name === "string" && name.length) {
      line += ` ${name}`;
    }

    // 2012-11-02 14:34:02,781 [prop: string value] INFO main - message
    return `${line} - ${message}`;
  }

  doLog(level: string, entry: LogEntry, properties?: LogProperties) {
    const error = this.formatError(entry);
    const message = this.formatMessage(level, entry, properties);

    this.delegate.log(level, `${message}\n`, properties);

    if (error) {
      this.delegate.log(level, `${error}\n`, properties);
    }
  }

  child(properties?: LogProperties) {
    return new PrettyLogger({
      ...this.config,
      delegate: this.delegate,
      properties,
    });
  }
}

export { PrettyLogger };
