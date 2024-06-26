import {
	isMainThread,
	parentPort,
	workerData,
	Worker as WorkerThread
} from "node:worker_threads";

import type { TerrainWorker } from "./worker";
import type { TerrainGenerator } from "../generator";
import type { DimensionType } from "@serenityjs/protocol";

interface WorkerData {
	cx: number;
	cz: number;
	type: DimensionType;
}

function Worker(generator: typeof TerrainGenerator) {
	return function (worker: typeof TerrainWorker) {
		// Bind the generator and worker together
		generator.worker = worker;

		// Declare the initialize method for the worker
		worker.initialize = (seed: number) => {
			// Check if we are in the main thread
			if (!isMainThread)
				throw new Error("Worker can only be initialized in a worker thread");

			// Create a new worker thread
			return new WorkerThread(worker.path, { workerData: seed });
		};

		// Check if we are in the worker thread
		if (!isMainThread) {
			// Set the seed of the worker
			const instance = new worker(workerData, generator);

			// Bind the message event to the worker
			parentPort?.on("message", (data: WorkerData) => {
				// Call the apply method of the worker to generate the chunk
				const chunk = instance.apply(data.cx, data.cz, data.type);

				// Send the generated chunk back to the main thread
				parentPort?.postMessage(chunk);
			});
		}
	};
}

export { Worker };
