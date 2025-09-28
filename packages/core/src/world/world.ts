import { Logger, LoggerColors } from "@serenityjs/logger";
import {
  DataPacket,
  Difficulty,
  Gamemode,
  GameRule,
  SetDefaultGamemodePacket,
  SetDifficultyPacket,
  SetTimePacket,
  TextPacket,
  TextPacketType
} from "@serenityjs/protocol";
import Emitter from "@serenityjs/emitter";

import { Serenity } from "../serenity";
import {
  DimensionProperties,
  RawMessage,
  RawText,
  WorldEventSignals,
  WorldProperties
} from "../types";
import { Entity, EntityPalette, Player } from "../entity";
import { ItemPalette } from "../item";
import { BlockPalette } from "../block";
import { OperatorCommands, CommandPalette, CommonCommands } from "../commands";
import { WorldTickSignal } from "../events";
import { EffectPallete } from "../effect";
import { TimeOfDay } from "../enums";
import { DefaultWorldProperties } from "../constants";
import { BiomePalette } from "../biome";

import { WorldProvider } from "./provider";
import { DefaultDimensionProperties, Dimension } from "./dimension";
import { TickSchedule } from "./schedule";
import { Scoreboard } from "./scoreboard";
import { Structure } from "./structure";

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
   * The biome palette of the world.
   */
  public readonly biomePalette = new BiomePalette();

  /**
   * The command palette of the world.
   */
  public readonly commandPalette = new CommandPalette();

  /**
   * The scoreboard for the world.
   */
  public readonly scoreboard = new Scoreboard(this);

  public readonly structures = new Map<string, Structure>();

  /**
   * The current gamerules values of the world.
   */
  public get gamerules(): Partial<Record<GameRule, boolean | number | string>> {
    return this.properties.gamerules;
  }

  /**
   * The current tick of the world.
   */
  public get currentTick(): bigint {
    return this.serenity.currentTick;
  }

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

    // Assign the world to the provider
    this.provider.world = this;

    // Assign the properties to the world with the default properties
    this.properties = { ...DefaultWorldProperties, ...properties };

    // Assign the identifier to the world
    this.identifier = this.properties.identifier;

    // Create a new logger for the world
    this.logger = new Logger(this.identifier, LoggerColors.DarkPurple);

    // Register all the global commands
    for (const command of serenity.commandPalette.getAll())
      this.commandPalette.commands.set(command.name, command);

    // Register the admin commands
    for (const command of [...OperatorCommands, ...CommonCommands])
      command(this);

    // Register the dimensions from the properties
    for (const entry of this.properties.dimensions) this.createDimension(entry);
  }

  /**
   * Ticks the world with a given delta tick.
   * @param deltaTick The delta tick to tick the world with.
   */
  public onTick(deltaTick: number): void {
    // Check if there are no players in the world
    if (this.getPlayers().length === 0) return;

    // Create a new WorldTickSignal
    const signal = new WorldTickSignal(
      this.currentTick,
      BigInt(deltaTick),
      this
    ).emit();

    // Return if the signal was not emitted
    if (!signal) return;

    // Increment the day time; day time is 24000 ticks long
    // Only increment if the day light cycle is enabled
    if (this.gamerules.doDayLightCycle)
      this.dayTime = (this.dayTime + 1) % 24_000;

    // Attempt to tick each dimension
    for (const [identifier, dimension] of this.dimensions) {
      try {
        // Tick the dimension with the delta tick
        dimension.onTick(deltaTick);
      } catch (reason) {
        // Log that the dimension failed to tick
        this.logger.error(`Failed to tick dimension ${identifier}`, reason);
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

    // Check if the current tick is divisible by the save interval (in minutes)
    if (
      this.currentTick !== 0n &&
      this.currentTick % (BigInt(this.properties.saveInterval) * 1200n) === 0n
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
  public sendMessage(message: string | RawMessage): void {
    // Construct the text packet.
    const packet = new TextPacket();

    // Prepare the raw text object.
    const rawText: RawText = {};

    // Check if the message is a string or RawMessage
    if (typeof message === "string") rawText.rawtext = [{ text: message }];
    else rawText.rawtext = message.rawtext;

    // Assign the packet data.
    packet.type = TextPacketType.Json;
    packet.needsTranslation = true;
    packet.source = null;
    packet.message = JSON.stringify(rawText);
    packet.parameters = null;
    packet.xuid = "";
    packet.platformChatId = "";
    packet.filtered = JSON.stringify(rawText);

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
    return [...this.serenity.players.values()].filter(
      (player) => player.world === this
    );
  }

  /**
   * Gets all the entities in the world.
   * @returns An array of entities.
   */
  public getEntities(): Array<Entity> {
    // Prepare an array of entities
    const entities: Array<Entity> = [];

    // Iterate over each dimension
    for (const dimension of this.dimensions.values()) {
      // Get the entities in the dimension
      const dimensionEntities = dimension.getEntities();

      // Add the entities to the array
      entities.push(...dimensionEntities);
    }

    // Return the entities
    return entities;
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
    this.serenity.schedules.add(schedule);

    // Return the schedule
    return schedule;
  }

  /**
   * Sends a packet to all players in the world.
   * @param packets
   */
  public broadcast(...packets: Array<DataPacket>): void {
    // Iterate over each dimension in the world
    for (const [, dimension] of this.dimensions)
      dimension.broadcast(...packets); // Broadcast the packets to all players in the dimension
  }

  /**
   * Sends a packet to all players in the world immediately.
   * This will bypass the RakNet queue and send the packet immediately.
   * @param packets The packets to send.
   */
  public broadcastImmediate(...packets: Array<DataPacket>): void {
    // Iterate over each dimension in the world
    for (const [, dimension] of this.dimensions)
      dimension.broadcastImmediate(...packets); // Broadcast the packets to all players in the dimension
  }

  /**
   * Sends a packet to all players in the world except for the specified player.
   * @param player The player to exclude from the broadcast.
   * @param packets The packets to send.
   */
  public broadcastExcept(player: Player, ...packets: Array<DataPacket>): void {
    // Iterate over each dimension in the world
    for (const [, dimension] of this.dimensions)
      dimension.broadcastExcept(player, ...packets); // Broadcast the packets to all players in the dimension
  }

  /**
   * Sets the current time of day for the world.
   * @param time The time of day to set.
   */
  public setTimeOfDay(time: number | TimeOfDay): void {
    // Normalize the time to be between 0 and 24000
    this.dayTime = time % 24000;

    // Create a new SetTimePacket
    const packet = new SetTimePacket();

    // Assign the time to the packet
    packet.time = this.dayTime;

    // Broadcast the packet to all players
    this.broadcast(packet);
  }

  /**
   * Gets the default gamemode for the world.
   * @returns The default gamemode.
   */
  public getDefaultGamemode(): Gamemode {
    // Switch based on the gamemode
    switch (this.properties.gamemode) {
      default:
        return this.properties.gamemode;

      case "survival":
        return Gamemode.Survival;

      case "creative":
        return Gamemode.Creative;

      case "adventure":
        return Gamemode.Adventure;

      case "spectator":
        return Gamemode.Spectator;
    }
  }

  /**
   * Sets the default gamemode for the world.
   * @param gamemode The gamemode to set.
   */
  public setDefaultGamemode(gamemode: Gamemode): void {
    switch (gamemode) {
      case Gamemode.Survival:
        this.properties.gamemode = "survival";
        break;

      case Gamemode.Creative:
        this.properties.gamemode = "creative";
        break;

      case Gamemode.Adventure:
        this.properties.gamemode = "adventure";
        break;

      case Gamemode.Spectator:
        this.properties.gamemode = "spectator";
        break;
    }

    // Create a new SetDefaultGamemode
    const packet = new SetDefaultGamemodePacket();
    packet.gamemode = gamemode;

    // Broadcast the packet to all players
    this.broadcast(packet);
  }

  /**
   * Get the current difficulty of the world.
   * @returns The difficulty of the world.
   */
  public getDifficulty(): Difficulty {
    switch (this.properties.difficulty) {
      default:
        return this.properties.difficulty;

      case "peaceful":
        return Difficulty.Peaceful;

      case "easy":
        return Difficulty.Easy;

      case "normal":
        return Difficulty.Normal;

      case "hard":
        return Difficulty.Hard;
    }
  }

  /**
   * Set the current difficulty of the world.
   * @param difficulty The difficulty to set.
   */
  public setDifficulty(difficulty: Difficulty): void {
    switch (difficulty) {
      case Difficulty.Peaceful:
        this.properties.difficulty = "peaceful";
        break;

      case Difficulty.Easy:
        this.properties.difficulty = "easy";
        break;

      case Difficulty.Normal:
        this.properties.difficulty = "normal";
        break;

      case Difficulty.Hard:
        this.properties.difficulty = "hard";
        break;
    }

    // Create a new SetDifficultyPacket
    const packet = new SetDifficultyPacket();
    packet.difficulty = difficulty;

    // Broadcast the packet to all players
    this.broadcast(packet);
  }

  /**
   * Get a structure by the identifier from the world
   * @param identifier The identifier of the structure
   * @returns The structure, if found; otherwise, null
   */
  public getStructure(identifier: string): Structure | null {
    return this.structures.get(identifier) ?? null;
  }

  /**
   * Adds a structure with the given identifier.
   * @param identifier The identifier of the structure
   * @param structure The structure to be registered
   */
  public addStructure(identifier: string, structure: Structure): void {
    this.structures.set(identifier, structure);
  }

  /**
   * Removes a structure by the identifier from the world
   * @param identifier The identifier of the structure
   */
  public removeStructure(identifier: string): void {
    this.structures.delete(identifier);
  }
}

export { World };
