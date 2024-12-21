import { Logger, LoggerColors } from "@serenityjs/logger";
import { DataPacket, DimensionType, SetTimePacket } from "@serenityjs/protocol";
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
import { AdminCommands, Commands, CommonCommands } from "../commands";
import { WorldTickSignal } from "../events";
import { EffectPallete } from "../effect";

import { WorldProvider } from "./provider";
import { DefaultDimensionProperties, Dimension } from "./dimension";
import { TickSchedule } from "./schedule";
import { Scoreboard } from "./scoreboard";

const DefaultWorldProperties: WorldProperties = {
  identifier: "default",
  seed: Math.floor(Math.random() * 2 ** 32),
  saveInterval: 5,
  dimensions: [
    {
      identifier: "overworld",
      type: DimensionType.Overworld,
      generator: "superflat",
      viewDistance: 20,
      simulationDistance: 10,
      spawnPosition: [0, 32767, 0]
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
   * The effect palette of the world.
   */
  public readonly effectPalette = new EffectPallete();

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
   * The pending schedules of the world.
   */
  public readonly schedules = new Set<TickSchedule>();

  /**
   * The scoreboard for the world.
   */
  public readonly scoreboard = new Scoreboard(this);

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
    for (const command of [...AdminCommands, ...CommonCommands]) command(this);

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

    // Check if the current tick is divisible by 500 (25 seconds)
    // When want to sync the dayTime with the client, as stress could cause de-sync
    if (this.currentTick % 500n === 0n) {
      // Create a new SetTimePacket
      const packet = new SetTimePacket();
      packet.time = this.dayTime;

      // Broadcast the time packet to all players
      this.broadcast(packet);
    }

    // Check if there are any schedules to execute
    if (this.schedules.size > 0) {
      // Iterate over the schedules
      for (const schedule of this.schedules) {
        // Check if the schedule is complete
        if (this.currentTick >= schedule.completeTick) {
          // Execute the schedule
          try {
            schedule.execute();
          } catch (reason) {
            // Log the error if the schedule failed to execute
            this.logger.error(
              `Failed to execute schedule for dimension at tick ${schedule.completeTick}`,
              reason
            );
          }

          // Delete the schedule
          this.schedules.delete(schedule);
        }
      }
    }

    // Check if the current tick is divisible by the save interval (in minutes)
    if (
      this.currentTick % (BigInt(this.properties.saveInterval) * 1200n) ===
      0n
    ) {
      // Save the world via the provider
      this.provider.onSave();
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
    for (const player of this.getPlayers()) player.sendMessage(message);
  }

  /**
   * Broadcasts a popup message to all players in the world.
   * @param message The message to broadcast.
   */
  public sendPopup(message: string): void {
    for (const player of this.getPlayers()) player.sendPopup(message);
  }

  /**
   * Broadcasts a tip message to all players in the world.
   * @param message The message to broadcast.
   */
  public sendTip(message: string): void {
    for (const player of this.getPlayers()) player.sendTip(message);
  }

  /**
   * Broadcasts a jukebox popup message to all players in the world.
   * @param message The message to broadcast.
   */
  public sendJukeboxPopup(message: string): void {
    for (const player of this.getPlayers()) player.sendJukeboxPopup(message);
  }

  /**
   * Broadcasts a toast notification to all players in the world.
   * @param title The title of the toast notification.
   * @param message The message of the toast notification.
   */
  public sendToastNotification(title: string, message: string): void {
    for (const player of this.getPlayers())
      player.sendToastNotification(title, message);
  }

  /**
   * Broadcasts a title to all players in the world.
   * @param title The title of the title.
   * @param fadeInTime The time it takes for the title to fade in.
   * @param stayTime The time the title stays on the screen.
   * @param fadeOutTime The time it takes for the title to fade out.
   */
  public sendTitle(
    title: string,
    fadeInTime?: number,
    stayTime?: number,
    fadeOutTime?: number
  ): void {
    for (const player of this.getPlayers())
      player.sendTitle(title, fadeInTime, stayTime, fadeOutTime);
  }

  /**
   * Broadcasts a subtitle to all players in the world.
   * @param message The message of the subtitle.
   * @param fadeInTime The time it takes for the title to fade in.
   * @param stayTime The time the title stays on the screen.
   * @param fadeOutTime The time it takes for the title to fade out.
   */
  public sendSubtitle(
    message: string,
    fadeInTime?: number,
    stayTime?: number,
    fadeOutTime?: number
  ): void {
    for (const player of this.getPlayers())
      player.sendSubTitle(message, fadeInTime, stayTime, fadeOutTime);
  }

  /**
   * Broadcasts an actionbar message to all players in the world.
   * @param message The message of the action bar.
   */
  public sendActionBar(message: string): void {
    for (const player of this.getPlayers()) player.sendActionBar(message);
  }

  /**
   * Broadcasts an title times to all players in the world.
   * @param message The message that will be sent.
   * @param fadeInTime The time it takes for the subtitle to fade in.
   * @param stayTime The time the subtitle stays on the screen.
   * @param fadeOutTime The time it takes for the subtitle to fade out.
   */
  public setTitleTimes(
    fadeInTime: number,
    stayTime: number,
    fadeOutTime: number
  ): void {
    for (const player of this.getPlayers())
      player.setTitleTimes(fadeInTime, stayTime, fadeOutTime);
  }

  /**
   * Broadcasts a reset title to all players in the world.
   */
  public resetTitles(): void {
    for (const player of this.getPlayers()) player.resetTitles();
  }

  /**
   * Broadcasts a clear title to all players in the world.
   */
  public clearTitles(): void {
    for (const player of this.getPlayers()) player.clearTitles();
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

  /**
   * Schedule an execution of a function after a specified amount of ticks.
   * @param ticks The amount of ticks to wait before the schedule is complete.
   * @returns The created tick schedule.
   */
  public schedule(ticks: number): TickSchedule {
    // Create a new tick schedule
    const schedule = new TickSchedule(ticks, this);

    // Add the schedule to the world
    this.schedules.add(schedule);

    // Return the schedule
    return schedule;
  }

  /**
   * Sends a packet to all players in the world.
   * @param packets
   */
  public broadcast(...packets: Array<DataPacket>): void {
    for (const player of this.getPlayers()) player.send(...packets);
  }

  /**
   * Sends a packet to all players in the world immediately.
   * This will bypass the RakNet queue and send the packet immediately.
   * @param packets The packets to send.
   */
  public broadcastImmediate(...packets: Array<DataPacket>): void {
    for (const player of this.getPlayers()) player.sendImmediate(...packets);
  }

  /**
   * Sends a packet to all players in the world except for the specified player.
   * @param player The player to exclude from the broadcast.
   * @param packets The packets to send.
   */
  public broadcastExcept(player: Player, ...packets: Array<DataPacket>): void {
    for (const other of this.getPlayers())
      if (other !== player) other.send(...packets);
  }
}

export { World };
