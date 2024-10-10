import { CompressionMethod } from "@serenityjs/protocol";

import { Network } from "./network";
import { Handlers } from "./handlers";

import type { ServerProperties } from "./types";

const DefaultProperties: ServerProperties = {
  port: 19132,
  address: "0.0.0.0",
  compressionMethod: CompressionMethod.Zlib,
  compressionThreshold: 256,
  packetsPerFrame: 64
};

class Serenity {
  /**
   * The properties that are being used for the server
   */
  public readonly properties: ServerProperties = DefaultProperties;

  /**
   * The network handler for the server
   */
  public readonly network: Network;

  /**
   * Whether the server is currently running or not
   */
  public alive = true;

  /**
   * The ticks that have been recorded by the server
   */
  public ticks: Array<number> = [];

  /**
   * The current ticks per second of the server
   */
  public tps = 0;

  /**
   * Creates a new serenity server with the specified properties
   * @param properties The properties to use for the server
   */
  public constructor(properties?: Partial<ServerProperties>) {
    // Assign the properties to the server with the default properties
    this.properties = { ...DefaultProperties, ...properties };

    // Create a new network handler for the server
    this.network = new Network(this, Handlers);
  }

  /**
   * Starts the server and begins listening for incoming connections
   */
  public start(): void {
    // Start the raknet server
    this.network.raknet.start();

    // Initialize the last tick variable
    let lastTick = process.hrtime();

    const TPS = 20;

    // Create a ticking loop that will run every 50ms
    const tick = () => {
      // Check if the server is still alive
      if (!this.alive) return;

      // Get the current time
      const [seconds, nanoseconds] = process.hrtime(lastTick);
      const delta = seconds + nanoseconds / 1e9;

      // Check if the server should tick
      if (delta >= 1 / TPS) {
        // Set the last tick to the current time
        lastTick = process.hrtime();

        // Calculate the delta time
        const _deltaTick = delta * 1000;

        // Calculate the server tps
        this.ticks.push(Date.now());
        const threshold = Date.now() - 1000;
        this.ticks = this.ticks.filter((tick) => tick > threshold);
        this.tps = this.ticks.length;

        // // Tick the debugger
        // this.debugger.tick(deltaTick);

        // // Tick all the worlds
        // for (const world of this.worlds.getAll())
        //   world.tick(Math.floor(deltaTick));
      }

      // Schedule the next tick
      setImmediate(tick);
    };

    // Start the ticking loop
    tick();
  }
}

export { Serenity };
