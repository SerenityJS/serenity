import {
  isMainThread,
  parentPort,
  workerData,
  Worker as WorkerThread
} from "node:worker_threads";

import { DimensionType } from "@serenityjs/protocol";

import { TerrainGeneratorProperties } from "../../../types";

import type { TerrainWorker } from "./worker";
import type { TerrainGenerator } from "../generator";

interface WorkerData {
  generator: true;
  cx: number;
  cz: number;
  type: DimensionType;
  id: string;
}

function Worker(generator: typeof TerrainGenerator) {
  return function (worker: typeof TerrainWorker) {
    // Bind the generator and worker together
    generator._worker = worker;

    // Declare the initialize method for the worker
    worker.initialize = (properties: TerrainGeneratorProperties) => {
      // Check if we are in the main thread
      if (!isMainThread)
        throw new Error("Worker can only be initialized in a worker thread");

      // Create a new worker thread
      return new WorkerThread(worker.path, { workerData: properties });
    };

    // Check if we are in the worker thread
    if (!isMainThread) {
      // Set the seed of the worker
      const instance = new worker(generator, workerData);

      // Bind the message event to the worker
      parentPort?.on("message", (data: WorkerData) => {
        // Check if the data is for the generator
        if (!data.generator) return;

        // Call the apply method of the worker to generate the chunk
        const chunk = instance.apply(data.cx, data.cz, data.type);

        // Send the generated chunk back to the main thread
        parentPort?.postMessage({ identifier: generator.identifier, ...chunk });
      });
    }
  };
}

export { Worker };
