const { workerData, parentPort } = require("worker_threads");

const run = async (deserializeError) => {
  // https://github.com/TypeStrong/ts-node/issues/846#issuecomment-631828160
  const isTsNode = process[Symbol.for("ts-node.register.instance")];

  if (workerData.loggerImplementationPath.endsWith(".ts") && !isTsNode) {
    require("ts-node/register");
  }

  const { loggerFactory } = require(workerData.loggerImplementationPath);

  const logger = loggerFactory();

  parentPort.on("message", (message) => {
    if (message.type === "string-log-entry") {
      logger.log(message.level, message.entry, message.properties);
    }
    else if (message.type === "error-log-entry") {
      const entry = deserializeError(message.entry);

      logger.log(message.level, entry, message.properties);
    }
  });
};

const promise = import("serialize-error").then(({ deserializeError }) => {
  return run(deserializeError);
});

parentPort.on("message", async (message) => {
  if (message.type === "ping") {
    await promise;

    parentPort.postMessage({ type: "pong" });
  }
});

return promise;
