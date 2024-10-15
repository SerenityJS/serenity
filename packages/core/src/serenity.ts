import { CompressionMethod } from "@serenityjs/protocol";
import { Logger, LoggerColors } from "@serenityjs/logger";
import { Connection } from "@serenityjs/raknet";

import { Network } from "./network";
import { Handlers } from "./handlers";
import {
  DefaultWorldProviderProperties,
  VoidGenerator,
  World,
  type WorldProvider
} from "./world";
import { Player } from "./entity";

import type {
  ServerProperties,
  WorldProperties,
  WorldProviderProperties
} from "./types";

const DefaultServerProperties: ServerProperties = {
  port: 19132,
  address: "0.0.0.0",
  compressionMethod: CompressionMethod.Zlib,
  compressionThreshold: 256,
  packetsPerFrame: 64,
  defaultGenerator: VoidGenerator,
  debugLogging: false
};

class Serenity {
  /**
   * The properties that are being used for the server
   */
  public readonly properties: ServerProperties = DefaultServerProperties;

  /**
   * The network handler for the server
   */
  public readonly network: Network;

  /**
   * The worlds that are currently loaded on the server
   */
  public readonly worlds = new Map<string, World>();

  /**
   * The registered providers and properties that are available to the server
   */
  public readonly providers = new Map<
    typeof WorldProvider,
    WorldProviderProperties
  >();

  /**
   * The logger instance for the server
   */
  public readonly logger = new Logger("Serenity", LoggerColors.Magenta);

  /**
   * The players that are currently connected to the server
   */
  public readonly players = new Map<Connection, Player>();

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
    this.properties = { ...DefaultServerProperties, ...properties };

    // Set the enabled value for debug logging
    Logger.DEBUG = this.properties.debugLogging;

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
        const deltaTick = delta * 1000;

        // Calculate the server tps
        this.ticks.push(Date.now());
        const threshold = Date.now() - 1000;
        this.ticks = this.ticks.filter((tick) => tick > threshold);
        this.tps = this.ticks.length;

        // // Tick the debugger
        // this.debugger.tick(deltaTick);

        // Tick all the worlds
        for (const world of this.worlds.values())
          world.onTick(Math.floor(deltaTick));
      }

      // Schedule the next tick
      setImmediate(tick);
    };

    // Start the ticking loop
    tick();
  }

  /**
   * Registers a provider with the server
   * @param provider The provider to register
   * @param properties The properties to use for the provider
   * @returns Whether the provider was successfully registered or not
   */
  public registerProvider(
    provider: typeof WorldProvider,
    properties?: Partial<WorldProviderProperties>
  ): boolean {
    // Check if the provider is already registered
    if (this.providers.has(provider)) {
      // Log that the provider is already registered
      this.logger.error(`Provider already registered: ${provider.identifier}`);

      // Return false if the provider is already registered
      return false;
    }

    // Attempt to initialize the provider, catch any errors
    try {
      // Initialize the provider
      provider.initialize(this, {
        ...DefaultWorldProviderProperties,
        ...properties
      });

      // Add the provider to the registered providers
      this.providers.set(provider, {
        ...DefaultWorldProviderProperties,
        ...properties
      });

      // Log that the provider has been registered
      this.logger.debug(`Registered provider: ${provider.identifier}`);

      // Add the provider to the server
      return true;
    } catch (reason) {
      // Log the error
      this.logger.error(
        `Failed to register provider: ${provider.identifier}`,
        reason
      );

      // Return false if the provider failed to register
      return false;
    }
  }

  /**
   * Creates a new world using the specified provider
   * @param provider The provider to use for the world
   * @param properties The properties to use for the world
   * @returns The created world, if successful; otherwise, false
   */
  public createWorld(
    provider: typeof WorldProvider,
    properties?: WorldProperties
  ): World | false {
    // Get the provider properties from the registered providers
    const providerProperties = this.providers.get(provider);

    // Check if the provider is registered
    if (!providerProperties) {
      // Log that the provider is not registered
      this.logger.error(
        `Failed to create world, as the given provider is not registered: ${provider.identifier}`
      );

      // Return false if the provider is not registered
      return false;
    }

    // Create a new world using the provider
    const world = provider.create(this, providerProperties, properties);

    // Add the world to the server
    this.worlds.set(world.identifier, world);

    // Return the created world
    return world;
  }

  public getWorld(): World;
  public getWorld(identifier: string): World | null;
  public getWorld(identifier?: string): World | null {
    // Check if the identifier is not provided
    if (!identifier) {
      // Get the first world from the worlds map
      return this.worlds.values().next().value ?? null;
    }

    // Get the world from the worlds map
    return this.worlds.get(identifier) ?? null;
  }

  public getPlayerByConnection(connection: Connection): Player | null {
    return this.players.get(connection) ?? null;
  }

  public getPlayerByXuid(xuid: string): Player | null {
    return (
      [...this.players.values()].find((player) => player.xuid === xuid) ?? null
    );
  }

  public getPlayerByUsername(username: string): Player | null {
    return (
      [...this.players.values()].find(
        (player) => player.username === username
      ) ?? null
    );
  }

  public getPlayerByUuid(uuid: string): Player | null {
    return (
      [...this.players.values()].find((player) => player.uuid === uuid) ?? null
    );
  }
}

export { Serenity };
