import {
  BlockFace,
  BlockPosition,
  ContainerId,
  ContainerOpenPacket,
  ContainerType
} from "@serenityjs/protocol";
import { ByteTag, IntTag, StringTag } from "@serenityjs/nbt";

import { BlockInteractionOptions } from "../..";
import { BlockIdentifier } from "../../enums";
import { TraitOnTickDetails } from "../../trait";

import { BlockTrait } from "./trait";

import type { Block } from "../block";

/**
 * The faces opposite each face of a block.
 */
const OppositeFaces: Record<BlockFace, BlockFace> = {
  [BlockFace.Bottom]: BlockFace.Top,
  [BlockFace.Top]: BlockFace.Bottom,
  [BlockFace.North]: BlockFace.South,
  [BlockFace.South]: BlockFace.North,
  [BlockFace.West]: BlockFace.East,
  [BlockFace.East]: BlockFace.West
};

/**
 * The faces a lever is attached by, for each of its directions.
 * The lever is attached to the block on the opposite side.
 */
const LeverFaces: Record<string, BlockFace> = {
  down_east_west: BlockFace.Bottom,
  down_north_south: BlockFace.Bottom,
  up_east_west: BlockFace.Top,
  up_north_south: BlockFace.Top,
  north: BlockFace.North,
  south: BlockFace.South,
  west: BlockFace.West,
  east: BlockFace.East
};

/**
 * The most command blocks a chain runs, as vanilla's maxCommandChainLength defaults to.
 */
const MAX_CHAIN_LENGTH = 65_536;

/**
 * Runs the command of impulse, repeating and chain command blocks.
 *
 * There is no redstone, so command blocks are powered by the power sources next to them:
 * pressed buttons and pressure plates, levers that are on, redstone blocks and torches,
 * powered redstone dust and observers. Buttons and levers also power the solid block
 * they are attached to, and with it the command blocks next to that block.
 */
class BlockCommandBlockTrait extends BlockTrait {
  public static readonly identifier = "command_block";
  public static readonly types = [
    BlockIdentifier.CommandBlock,
    BlockIdentifier.RepeatingCommandBlock,
    BlockIdentifier.ChainCommandBlock
  ];

  /**
   * Whether the command block was active on the last tick, or null before its first tick.
   */
  private active: boolean | null = null;

  /**
   * The tick the command block runs its command on next, if it is waiting to.
   */
  private nextRunTick: bigint | null = null;

  /**
   * The tick the command block last ran its command on.
   */
  private lastRunTick = -1n;

  public onInteract(options: BlockInteractionOptions): void {
    // Get the origin of the interaction
    const { origin, cancel } = options;

    // Check if the block interaction has been cancelled or if there is no origin
    if (cancel || !origin) return;

    // Check if the player is sneaking or not an operator
    if (origin.isSneaking || !origin.isOp) return;

    // Opening the command block takes the place of placing a block on it
    options.placingBlock = false;

    // Create the container open packet
    const packet = new ContainerOpenPacket();
    packet.identifier = ContainerId.None;
    packet.type = ContainerType.CommandBlock;
    packet.position = this.block.position;
    packet.uniqueId = -1n;

    // Send the container open packet to the player
    return origin.send(packet);
  }

  public onTick({ currentTick }: TraitOnTickDetails): void {
    // Check whether the command block is powered, and store it for the command block screen
    const powered = this.isReceivingPower();
    if (powered !== this.getPowered()) this.setPowered(powered);

    // The command block is active while it is always active or powered
    const active = this.getAlwaysActive() || powered;
    const wasActive = this.active;
    this.active = active;

    switch (this.block.identifier) {
      // Impulse command blocks run once each time they become active.
      // They do not run when they are loaded while already active.
      case BlockIdentifier.CommandBlock: {
        if (active && wasActive === false) this.schedule(currentTick);
        break;
      }

      // Repeating command blocks run every tick delay while they are active.
      case BlockIdentifier.RepeatingCommandBlock: {
        if (!active) this.nextRunTick = null;
        else if (this.nextRunTick === null) {
          // The first run waits for the tick delay, unless set to run on the first tick
          const delay = this.getExecuteOnFirstTick() ? 0 : this.getTickDelay();
          this.nextRunTick = currentTick + BigInt(delay);
        }
        break;
      }
    }

    // Check if the command block is due to run its command
    if (this.nextRunTick === null || currentTick < this.nextRunTick) return;

    // Repeating command blocks run again after their tick delay
    this.nextRunTick =
      this.block.identifier === BlockIdentifier.RepeatingCommandBlock
        ? currentTick + BigInt(Math.max(this.getTickDelay(), 1))
        : null;

    // Run the command of the command block
    this.run(currentTick);
  }

  /**
   * Runs the command, once the tick delay has passed if there is one.
   * @param currentTick The current tick.
   */
  public schedule(currentTick: bigint): void {
    // Get the tick delay of the command block
    const delay = this.getTickDelay();

    // Run the command now if there is no tick delay, otherwise wait for it
    if (delay <= 0) this.run(currentTick);
    else this.nextRunTick = currentTick + BigInt(delay);
  }

  /**
   * Runs the command of the command block, then the chain command block it points into.
   * @param currentTick The current tick.
   * @param length The number of command blocks the chain has run so far.
   */
  public run(currentTick: bigint, length = 1): void {
    // A command block runs once a tick, which also stops chains that loop
    if (this.lastRunTick === currentTick) return;
    this.lastRunTick = currentTick;

    // Conditional command blocks only run if the command block behind them succeeded
    if (this.isConditional() && !this.behindSucceeded()) {
      this.setSuccessCount(0);
    } else this.execute();

    // Check if the chain is at its longest
    if (length >= MAX_CHAIN_LENGTH) return;

    // Get the chain command block the command block points into
    const next = this.block.face(this.getFacing());
    if (next.identifier !== BlockIdentifier.ChainCommandBlock) return;

    // Chain command blocks run when they are active
    const trait = next.getTrait(BlockCommandBlockTrait);
    if (!trait || !(trait.getAlwaysActive() || trait.isReceivingPower()))
      return;

    // Run the chain command block, after its tick delay if it has one
    if (trait.getTickDelay() > 0) trait.schedule(currentTick);
    else trait.run(currentTick, length + 1);
  }

  /**
   * Executes the command at the command block, and stores the result.
   */
  private execute(): void {
    // Get the command of the command block
    const command = this.getCommand().trim();

    // Command blocks without a command do nothing
    if (command.length === 0) return this.setSuccessCount(0);

    // Execute the command at the center of the command block
    const position = BlockPosition.toVector3f(this.block.position);
    position.x += 0.5;
    position.y += 0.5;
    position.z += 0.5;

    try {
      const result = this.block.dimension.executeCommand(command, position);

      // Store the success of the command, and its output
      this.setSuccessCount(1);
      this.storeOutput(result.message ?? "Command Executed Successfully");
    } catch (reason) {
      // Store the failure of the command, and its error
      this.setSuccessCount(0);
      this.storeOutput((reason as Error).message);
    }
  }

  /**
   * Stores the output of the command, if the command block tracks it.
   * @param output The output of the command.
   */
  private storeOutput(output: string): void {
    // Check if the command block tracks its output
    if (!this.getTrackOutput()) return;

    // Store the output if it changed
    if (this.getLastOutput() !== output) this.setLastOutput(output);
  }

  /**
   * Whether the command block behind this one, which points into it, succeeded the last time it ran.
   */
  private behindSucceeded(): boolean {
    // Get the block behind the command block
    const behind = this.block.face(OppositeFaces[this.getFacing()]);

    // Check if the block behind is a command block that succeeded
    const trait = behind.getTrait(BlockCommandBlockTrait);
    return trait ? trait.getSuccessCount() > 0 : false;
  }

  /**
   * Whether the command block is powered by a power source next to it.
   */
  public isReceivingPower(): boolean {
    for (const face of Object.values(OppositeFaces)) {
      // Get the block next to the command block
      const neighbor = this.block.face(face);

      // Check if the block is a power source
      if (this.isPowerSource(neighbor)) return true;

      // Check if the block is solid, and powered by a button or lever attached to it
      if (neighbor.isSolid && this.isPoweredByAttachment(neighbor)) return true;
    }

    // Return false, as nothing powers the command block
    return false;
  }

  /**
   * Whether a block is a power source that is on.
   * @param block The block to check.
   */
  private isPowerSource(block: Block): boolean {
    // Get the identifier of the block
    const identifier = block.identifier;

    // Buttons are on while pressed
    if (block.hasState("button_pressed_bit"))
      return block.getState<boolean>("button_pressed_bit");

    // Levers are on while open
    if (identifier === BlockIdentifier.Lever)
      return block.getState<boolean>("open_bit");

    // Pressure plates and redstone dust are on while they have a signal
    if (block.hasState("redstone_signal"))
      return block.getState<number>("redstone_signal") > 0;

    // Observers are on while powered
    if (identifier === BlockIdentifier.Observer)
      return block.getState<boolean>("powered_bit");

    // Redstone blocks and torches are always on
    return (
      identifier === BlockIdentifier.RedstoneBlock ||
      identifier === BlockIdentifier.RedstoneTorch
    );
  }

  /**
   * Whether a solid block is powered by a button or lever that is on and attached to it.
   * @param block The solid block to check.
   */
  private isPoweredByAttachment(block: Block): boolean {
    for (const face of Object.values(OppositeFaces)) {
      // Get the block on the face of the solid block
      const attached = block.face(face);

      // Buttons face away from the block they are attached to
      if (attached.hasState("button_pressed_bit")) {
        if (
          attached.getState<boolean>("button_pressed_bit") &&
          attached.getState<number>("facing_direction") === face
        )
          return true;
      }

      // Levers are attached on the side their direction names
      else if (attached.identifier === BlockIdentifier.Lever) {
        const direction = attached.getState<string>("lever_direction");
        if (
          attached.getState<boolean>("open_bit") &&
          LeverFaces[direction] === face
        )
          return true;
      }
    }

    // Return false, as nothing attached to the block powers it
    return false;
  }

  /**
   * Gets the face the command block points out of.
   */
  public getFacing(): BlockFace {
    return this.block.getState<number>("facing_direction") as BlockFace;
  }

  /**
   * Whether the command block only runs if the command block behind it succeeded.
   */
  public isConditional(): boolean {
    return this.block.getState<boolean>("conditional_bit") ?? false;
  }

  public getCommand(): string {
    // Get the command from the NBT data
    const command = this.block.getStorageEntry<StringTag>("Command");

    // Return the command if it exists
    return command ? command.valueOf() : "";
  }

  public setCommand(value: string): void {
    // Create the command NBT tag
    const command = new StringTag(value, "Command");

    // Set the command NBT tag
    this.block.setStorageEntry("Command", command);
  }

  public getLastOutput(): string {
    // Get the last output from the NBT data
    const lastOutput = this.block.getStorageEntry<StringTag>("LastOutput");

    // Return the last output if it exists
    return lastOutput ? lastOutput.valueOf() : "";
  }

  public setLastOutput(value: string): void {
    // Create the last output NBT tag
    const lastOutput = new StringTag(value, "LastOutput");

    // Set the last output NBT tag
    this.block.setStorageEntry("LastOutput", lastOutput);
  }

  public getTrackOutput(): boolean {
    // Get the track output from the NBT data, which is on by default
    const trackOutput = this.block.getStorageEntry<ByteTag>("TrackOutput");

    // Return the track output if it exists
    return trackOutput ? trackOutput.valueOf() === 1 : true;
  }

  public setTrackOutput(value: boolean): void {
    // Create the track output NBT tag
    const trackOutput = new ByteTag(value ? 1 : 0, "TrackOutput");

    // Set the track output NBT tag
    this.block.setStorageEntry("TrackOutput", trackOutput);
  }

  public getSuccessCount(): number {
    // Get the success count from the NBT data
    const successCount = this.block.getStorageEntry<IntTag>("SuccessCount");

    // Return the success count if it exists
    return successCount ? successCount.valueOf() : 0;
  }

  public setSuccessCount(value: number): void {
    // Check if the success count changed
    if (this.getSuccessCount() === value) return;

    // Create the success count NBT tag
    const successCount = new IntTag(value, "SuccessCount");

    // Set the success count NBT tag
    this.block.setStorageEntry("SuccessCount", successCount);
  }

  public getTickDelay(): number {
    // Get the tick delay from the NBT data
    const tickDelay = this.block.getStorageEntry<IntTag>("TickDelay");

    // Return the tick delay if it exists
    return tickDelay ? tickDelay.valueOf() : 0;
  }

  public setTickDelay(value: number): void {
    // Create the tick delay NBT tag
    const tickDelay = new IntTag(value, "TickDelay");

    // Set the tick delay NBT tag
    this.block.setStorageEntry("TickDelay", tickDelay);
  }

  public getExecuteOnFirstTick(): boolean {
    // Get the execute on first tick from the NBT data
    const executeOnFirstTick =
      this.block.getStorageEntry<ByteTag>("ExecuteOnFirstTick");

    // Return the execute on first tick if it exists
    return executeOnFirstTick ? executeOnFirstTick.valueOf() === 1 : false;
  }

  public setExecuteOnFirstTick(value: boolean): void {
    // Create the execute on first tick NBT tag
    const executeOnFirstTick = new ByteTag(value ? 1 : 0, "ExecuteOnFirstTick");

    // Set the execute on first tick NBT tag
    this.block.setStorageEntry("ExecuteOnFirstTick", executeOnFirstTick);
  }

  public getCustomName(): string {
    // Get the custom name from the NBT data
    const customName = this.block.getStorageEntry<StringTag>("CustomName");

    // Return the custom name if it exists
    return customName ? customName.valueOf() : "";
  }

  public setCustomName(value: string): void {
    // Create the custom name NBT tag
    const customName = new StringTag(value, "CustomName");

    // Set the custom name NBT tag
    this.block.setStorageEntry("CustomName", customName);
  }

  public getAlwaysActive(): boolean {
    // Get the always active from the NBT data
    const alwaysActive = this.block.getStorageEntry<ByteTag>("auto");

    // Return the always active if it exists
    return alwaysActive ? alwaysActive.valueOf() === 1 : false;
  }

  public setAlwaysActive(value: boolean): void {
    // Create the always active NBT tag
    const alwaysActive = new ByteTag(value ? 1 : 0, "auto");

    // Set the always active NBT tag
    this.block.setStorageEntry("auto", alwaysActive);
  }

  public getPowered(): boolean {
    // Get the powered from the NBT data
    const powered = this.block.getStorageEntry<ByteTag>("powered");

    // Return the powered if it exists
    return powered ? powered.valueOf() === 1 : false;
  }

  public setPowered(value: boolean): void {
    // Create the powered NBT tag
    const powered = new ByteTag(value ? 1 : 0, "powered");

    // Set the powered NBT tag
    this.block.setStorageEntry("powered", powered);
  }
}

export { BlockCommandBlockTrait };
