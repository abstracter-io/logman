import { LogProperties } from "../logger";

const extendProperties = (target: LogProperties, ...sources: (LogProperties | undefined)[]) => {
  for (const source of sources) {
    if (source) {
      for (const key of Object.keys(source)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

export { extendProperties };
