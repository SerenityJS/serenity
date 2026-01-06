import {
  isMainThread,
  parentPort,
  workerData,
  Worker as WorkerThread
} from "node:worker_threads";

import { WorkerMessage } from "./message";
import { WorkerMessageType } from "./message-type";

import type { ProviderWorker } from "./provider-worker";
import type { WorldProvider } from "../provider";
import type { TerrainWorker } from "./worker";
import type { TerrainGenerator } from "../generator";

type WorkerTarget = typeof TerrainGenerator | typeof WorldProvider;

function Worker(target: WorkerTarget) {
  return function (worker: typeof TerrainWorker | typeof ProviderWorker) {
    // Bind the generator and worker together
    target.worker = worker;

    // Declare the initialize method for the worker
    worker.initialize = (properties: unknown) => {
      // Check if we are in the main thread
      if (!isMainThread)
        throw new Error("Worker can only be initialized in a worker thread");

      // Create the worker data object
      const workerData = { identifier: target.identifier, properties };

      // Create a new worker thread
      const instance = new WorkerThread(worker.path, { workerData });

      return instance;
    };

    // Check if we are in the worker thread
    if (!isMainThread) {
      // Check if the identifier matches the generator's identifier
      if (target.identifier !== workerData.identifier) return;

      // Set the seed of the worker
      const instance = new worker(
        target as typeof TerrainGenerator & typeof WorldProvider,
        workerData.properties
      );

      let timer: NodeJS.Timeout | null = null;

      // Bind the message event to the worker
      parentPort?.on("message", async (data: WorkerMessage) => {
        // Check if the identifier matches the generator's identifier
        if (data.identifier !== instance.parent.identifier) return;

        // Add the message to the worker instance's message queue
        instance.messages.add(data);

        // // Send the message to the worker instance
        // const result = await instance.onParentMessage(data);

        // if (!result || result.identifier !== instance.parent.identifier) return;

        // try {
        //   // Switch the result type
        //   switch (result.type) {
        //     // Check for read chunk response to transfer the buffer
        //     case WorkerMessageType.ReadChunkResponse: {
        //       // Post the message back to the main thread with the buffer transferred
        //       return parentPort?.postMessage(result, [
        //         (result.data as { buffer: Uint8Array }).buffer
        //           .buffer as ArrayBuffer
        //       ]);
        //     }

        //     // Check for read chunk response null
        //     case WorkerMessageType.ReadChunkResponseNull: {
        //       // Post the message back to the main thread
        //       return parentPort?.postMessage({
        //         identifier: result.identifier,
        //         type: WorkerMessageType.ReadChunkResponseNull,
        //         data: result.data
        //       });
        //     }
        //   }
        // } catch (reason) {
        //   console.error(
        //     "Failed to post message to parent thread:",
        //     reason,
        //     result
        //   );
        // }
      });

      // Set an interval to process messages in batches
      timer = setInterval(async () => {
        // Get the next batch of messages
        const batch = instance.messages.getBatch();

        // console.log(
        //   `Worker ${instance.parent.identifier} processing batch of ${batch.length} messages`
        // );

        // Process each message in the batch
        for (const message of batch) {
          // Send the message to the worker instance
          const result = await instance.onParentMessage(message);

          if (!result || result.identifier !== instance.parent.identifier)
            continue;

          try {
            // Switch the result type
            switch (result.type) {
              // Check for read chunk response to transfer the buffer
              case WorkerMessageType.ReadChunkResponse: {
                // Post the message back to the main thread with the buffer transferred
                parentPort?.postMessage(result, [
                  (result.data as { buffer: Uint8Array }).buffer
                    .buffer as ArrayBuffer
                ]);

                break;
              }

              // Check for read chunk response null
              case WorkerMessageType.ReadChunkResponseNull: {
                // Post the message back to the main thread
                parentPort?.postMessage({
                  identifier: result.identifier,
                  type: WorkerMessageType.ReadChunkResponseNull,
                  data: result.data
                });

                break;
              }
            }
          } catch (reason) {
            console.error(
              "Failed to post message to parent thread:",
              reason,
              result
            );
          }
        }
      }, 25);

      // Bind the exit event to the worker
      process.on("exit", () => {
        // Clear the message processing interval
        if (timer) clearInterval(timer);
      });
    }
  };
}

export { Worker };
