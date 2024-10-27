import { Logger, LoggerColors } from "@serenityjs/logger";
import {
  DataPacket,
  DimensionType,
  TextPacket,
  TextPacketType
} from "@serenityjs/protocol";
import Emitter from "@serenityjs/emitter";

import { Serenity } from "../serenity";
import {
  DimensionProperties,
  WorldEventSignals,
  WorldProperties
} from "../types";
import { Entity, EntityPalette, Player } from "../entity";
import { ItemPalette } from "../item";
import { BlockPalette } from "../block";
import { AdminCommands, Commands } from "../commands";
import { WorldTickSignal } from "../events";

import { WorldProvider } from "./provider";
import { DefaultDimensionProperties, Dimension } from "./dimension";

const DefaultWorldProperties: WorldProperties = {
  identifier: "default",
  seed: Math.floor(Math.random() * 2 ** 32),
  dimensions: [
    {
      identifier: "overworld",
      type: DimensionType.Overworld,
      generator: "superflat"
    }
  ]
};

class World extends Emitter<WorldEventSignals> {
  /**
   * The serenity instance that the world belongs to.
   */
  public readonly serenity: Serenity;

  /**
   * The properties of the world.
   */
  public readonly properties: WorldProperties = DefaultWorldProperties;

  /**
   * The identifier of the world.
   */
  public readonly identifier: string;

  /**
   * The provider of the world.
   */
  public readonly provider: WorldProvider;

  /**
   * The dimensions of the world.
   */
  public readonly dimensions = new Map<string, Dimension>();

  /**
   * The logger of the world.
   */
  public readonly logger: Logger;

  /**
   * The entity palette of the world.
   */
  public readonly entityPalette = new EntityPalette();

  /**
   * The block palette of the world.
   */
  public readonly blockPalette = new BlockPalette();

  /**
   * The item palette of the world.
   */
  public readonly itemPalette = new ItemPalette();

  /**
   * The commands of the world.
   */
  public readonly commands = new Commands();

  /**
   * The current tick of the world.
   */
  public currentTick = 0n;

  /**
   * The current time of day for the world.
   */
  public dayTime = 0;

  public constructor(
    serenity: Serenity,
    provider: WorldProvider,
    properties?: Partial<WorldProperties>
  ) {
    super();

    // Assign the serenity and provider to the world
    this.serenity = serenity;
    this.provider = provider;

    // Assign the properties to the world with the default properties
    this.properties = { ...DefaultWorldProperties, ...properties };

    // Assign the identifier to the world
    this.identifier = this.properties.identifier;

    // Create a new logger for the world
    this.logger = new Logger(this.identifier, LoggerColors.GreenBright);

    // Register the admin commands
    for (const command of AdminCommands) command(this);

    // Register the dimensions from the properties
    for (const entry of this.properties.dimensions) this.createDimension(entry);
  }

  /**
   * Ticks the world with a given delta tick.
   * @param deltaTick The delta tick to tick the world with.
   */
  public onTick(deltaTick: number): void {
    // Return if there are no players in the world
    if (this.getPlayers().length === 0) return;

    // Create a new WorldTickSignal
    const signal = new WorldTickSignal(
      this.currentTick,
      BigInt(deltaTick),
      this
    ).emit();

    // Return if the signal was not emitted
    if (!signal) return;

    // Increment the current tick
    ++this.currentTick;

    // Increment the day time; day time is 24000 ticks long
    this.dayTime = (this.dayTime + 1) % 24_000;

    // Attempt to tick each dimension
    for (const dimension of this.dimensions.values()) {
      try {
        // Tick the dimension with the delta tick
        dimension.onTick(deltaTick);
      } catch (reason) {
        // Log that the dimension failed to tick
        this.logger.error(
          `Failed to tick dimension ${dimension.identifier}`,
          reason
        );
      }
    }
  }

  /**
   * Creates a new dimension with the specified generator and properties.
   * @param generator The generator to use for the dimension
   * @param properties The properties to use for the dimension
   * @returns The created dimension, if successful; otherwise, false
   */
  public createDimension(
    properties: Partial<DimensionProperties>
  ): Dimension | false {
    // Create the dimension properties
    const dimensionProperties = {
      ...DefaultDimensionProperties,
      ...properties
    };

    // Check if the dimension already exists
    if (this.dimensions.has(dimensionProperties.identifier)) {
      // Log that the dimension already exists
      this.logger.error(
        `Failed to create dimension with identifier ${dimensionProperties.identifier} as it already exists`
      );

      // Return false if the dimension already exists
      return false;
    }

    // Create a new dimension
    const dimension = new Dimension(this, dimensionProperties);

    // Register the dimension
    this.dimensions.set(dimension.identifier, dimension);

    // Log that the dimension has been created
    this.logger.debug(`Created dimension: ${dimension.identifier}`);

    // Return the created dimension
    return dimension;
  }

  /**
   * Broadcasts a message to all players in the world.
   * @param message The message to broadcast.
   */
  public sendMessage(message: string): void {
    // Construct the text packet.
    const packet = new TextPacket();

    // Assign the packet data.
    packet.type = TextPacketType.Raw;
    packet.needsTranslation = false;
    packet.source = null;
    packet.message = message;
    packet.parameters = null;
    packet.xuid = "";
    packet.platformChatId = "";
    packet.filtered = message;

    this.broadcast(packet);
  }

  /**
   * Get the default dimension for the world
   */
  public getDimension(): Dimension;

  /**
   * Get a dimension by the identifier from the world
   * @param identifier The identifier of the dimension
   * @returns The dimension, if found; otherwise, undefined
   */
  public getDimension(identifier: string): Dimension | undefined;

  /**
   * Get a dimension by the identifier from the world
   * @param identifier The identifier of the dimension
   * @returns The dimension, if found; otherwise, undefined
   */
  public getDimension(identifier?: string): Dimension | undefined {
    // Check if the identifier is undefined
    if (identifier === undefined) {
      // Get the first dimension
      return this.dimensions.values().next().value as Dimension;
    }

    // Get the dimension by the identifier
    return this.dimensions.get(identifier);
  }

  /**
   * Get all the dimensions in the world
   * @returns An array of dimensions
   */
  public getDimensions(): Array<Dimension> {
    return [...this.dimensions.values()];
  }

  /**
   * Gets all the players in the world.
   * @returns An array of players.
   */
  public getPlayers(): Array<Player> {
    return [...this.dimensions.values()].flatMap((dimension) =>
      dimension.getPlayers()
    );
  }

  /**
   * Gets all the entities in the world.
   * @returns An array of entities.
   */
  public getEntities(): Array<Entity> {
    return [...this.dimensions.values()].flatMap((dimension) =>
      dimension.getEntities()
    );
  }

  public broadcast(...packets: Array<DataPacket>): void {
    for (const player of this.getPlayers()) player.send(...packets);
  }

  public broadcastImmediate(...packets: Array<DataPacket>): void {
    for (const player of this.getPlayers()) player.sendImmediate(...packets);
  }

  public broadcastExcept(player: Player, ...packets: Array<DataPacket>): void {
    for (const other of this.getPlayers())
      if (other !== player) other.send(...packets);
  }
}

export { World };
