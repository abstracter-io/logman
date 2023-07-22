import path from "path";
import { Worker } from "worker_threads";

import { BaseLogger, BaseLoggerConfig } from "./base-logger";

import type { LogEntry, LogProperties } from "./logger";

// @ts-expect-error ignore
import type { serializeError } from "serialize-error";

type Config = BaseLoggerConfig & {
  worker: Worker;
};

const LOGGER_WORKER_PATH = path.resolve(__dirname, "../helpers/logger-worker.js");

const handleError = (error: Error) => {
  // Do no log using the logger, as it might create an infinite loop..
  console.error(error);
};

const SERIALIZE_ERROR = import("serialize-error").then(({ serializeError }) => {
  return serializeError;
});

class WorkerThreadLogger extends BaseLogger<Config> {
  private isWorkerReady: boolean;
  private serializeError: typeof serializeError | null;

  public constructor(config: Config) {
    super(config);
    this.isWorkerReady = false;
    this.serializeError = null;
  }

  private async delegateToWorker(level: string, entry: LogEntry, properties?: LogProperties) {
    if (!this.isWorkerReady) {
      await new Promise<void>((resolve) => {
        this.config.worker.once("message", (message) => {
          if (message.type === "pong") {
            this.isWorkerReady = true;

            resolve();
          }
        });

        this.config.worker.postMessage({ type: "ping" });
      });
    }

    if (entry instanceof Error) {
      if (this.serializeError === null) {
        this.serializeError = await SERIALIZE_ERROR;
      }

      this.config.worker.postMessage({
        level,
        properties,
        type: "error-log-entry",
        entry: this.serializeError(entry),
      });
    }
    else {
      this.config.worker.postMessage({
        type: "string-log-entry",
        level,
        entry,
        properties,
      });
    }
  }

  doLog(level: string, entry: LogEntry, properties?: LogProperties): void {
    this.delegateToWorker(level, entry, properties).catch(handleError);
  }

  child(properties?: LogProperties) {
    return new WorkerThreadLogger({
      ...this.config,
      properties: {
        ...this.config.properties,
        ...properties,
      },
    });
  }

  static createWorker(loggerImplementationPath: string) {
    // Handle errors: unhandledRejection & uncaughtException
    return new Worker(LOGGER_WORKER_PATH, {
      workerData: {
        loggerImplementationPath,
      },
    });
  }
}

export { WorkerThreadLogger };
