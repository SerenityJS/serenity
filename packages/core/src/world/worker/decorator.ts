import {
  isMainThread,
  parentPort,
  workerData,
  Worker as WorkerThread
} from "node:worker_threads";

import { DimensionType } from "@serenityjs/protocol";

import { TerrainGeneratorProperties } from "../../types";
import { Chunk } from "../chunk";

import type { TerrainWorker } from "./worker";
import type { TerrainGenerator } from "../generator";

interface WorkerData {
  cx: number;
  cz: number;
  type: DimensionType;
  identifier: string;
}

function Worker(generator: typeof TerrainGenerator) {
  return function (worker: typeof TerrainWorker) {
    // Bind the generator and worker together
    generator.worker = worker;

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
      parentPort?.on("message", async (data: WorkerData) => {
        // Pull the chunk coordinates and type from the data
        const { cx, cz, type, identifier } = data;

        // Check if the identifier matches the generator's identifier
        if (identifier !== instance.generator.identifier) return;

        // Call the apply method of the worker to generate the chunk
        const chunk = await instance.apply(cx, cz, type);

        // Serialize the chunk into a buffer
        const buffer = Chunk.serialize(chunk);

        // Get the chunk hash
        const hash = chunk.hash;

        // Send the buffer back to the main thread
        parentPort?.postMessage(
          { cx, cz, type, buffer, identifier, hash },
          [buffer.buffer as ArrayBuffer] // Transfer the buffer to avoid copying
        );
      });
    }
  };
}

export { Worker };
