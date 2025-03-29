import {
  ContainerId,
  ContainerOpenPacket,
  ContainerType
} from "@serenityjs/protocol";
import { ByteTag, IntTag, StringTag } from "@serenityjs/nbt";

import { BlockInteractionOptions } from "../..";
import { BlockIdentifier } from "../../enums";

import { BlockTrait } from "./trait";

class BlockCommandBlockTrait extends BlockTrait {
  public static readonly identifier = "command_block";
  public static readonly types = [BlockIdentifier.CommandBlock];

  public async onInteract({
    origin,
    cancel
  }: BlockInteractionOptions): Promise<void> {
    // Check if the block interaction has been cancelled or if there is no origin
    if (cancel || !origin) return;

    // Check if the player is sneaking or not an operator
    if (origin.isSneaking || !origin.isOp) return;

    // Create the container open packet
    const packet = new ContainerOpenPacket();
    packet.identifier = ContainerId.None;
    packet.type = ContainerType.CommandBlock;
    packet.position = this.block.position;
    packet.uniqueId = -1n;

    // Send the container open packet to the player
    return origin.send(packet);
  }

  public async onTick(): Promise<void> {
    // Check if the command block is always active or powered
    if (!this.getAlwaysActive() && !this.getPowered()) return;

    // Get the current tick and tick delay
    const currentTick = this.block.world.currentTick;
    const tickDelay = BigInt(this.getTickDelay());

    // Check if the current tick is divisible by the tick delay
    if (tickDelay === 0n || currentTick % tickDelay === 0n) {
      try {
        // Execute the command
        const result = this.block.dimension.executeCommand(this.getCommand());

        // Check if the last output message is the same as the result message
        if (this.getLastOutput() === result.message) return;

        // Set the last output message
        await this.setLastOutput(
          result.message ?? "Command Executed Successfully"
        );
      } catch (reason) {
        // Get the message from the error
        const message = (reason as Error).message;

        // Check if the last output message is the same as the result message
        if (this.getLastOutput() === message) return;

        // Set the last output message
        await this.setLastOutput((reason as Error).message);
      }
    }
  }

  /**
   * Gets the command of the command block.
   * @returns The command that is inputted into the command block.
   */
  public getCommand(): string {
    // Get the command from the NBT data
    const command = this.block.nbt.get<StringTag>("Command");

    // Return the command if it exists
    return command ? command.value : "";
  }

  /**
   * Sets the command of the command block.
   * @param value The command to set for the command block.
   */
  public async setCommand(value: string): Promise<void> {
    // Create the command NBT tag
    const command = new StringTag({ name: "Command", value });

    // Set the command NBT tag
    await this.block.nbt.set("Command", command);
  }

  /**
   * Get the last output message of the command block.
   * @returns The last output message.
   */
  public getLastOutput(): string {
    // Get the last output from the NBT data
    const lastOutput = this.block.nbt.get<StringTag>("LastOutput");

    // Return the last output if it exists
    return lastOutput ? lastOutput.value : "";
  }

  /**
   * Set the last output message of the command block.
   * @param value The last output message to set.
   */
  public async setLastOutput(value: string): Promise<void> {
    // Create the last output NBT tag
    const lastOutput = new StringTag({ name: "LastOutput", value });

    // Set the last output NBT tag
    await this.block.nbt.set("LastOutput", lastOutput);
  }

  /**
   * Get the tick delay of the command block.
   * @returns The tick delay of the command block.
   */
  public getTickDelay(): number {
    // Get the tick delay from the NBT data
    const tickDelay = this.block.nbt.get<IntTag>("TickDelay");

    // Return the tick delay if it exists
    return tickDelay ? tickDelay.value : 0;
  }

  /**
   * Set the tick delay of the command block.
   * @param value The tick delay to set.
   */
  public async setTickDelay(value: number): Promise<void> {
    // Create the tick delay NBT tag
    const tickDelay = new IntTag({ name: "TickDelay", value });

    // Set the tick delay NBT tag
    await this.block.nbt.set("TickDelay", tickDelay);
  }

  /**
   * Get the always active state of the command block.
   * @returns The always active state of the command block.
   */
  public getAlwaysActive(): boolean {
    // Get the always active from the NBT data
    const alwaysActive = this.block.nbt.get<ByteTag>("auto");

    // Return the always active if it exists
    return alwaysActive ? alwaysActive.value === 1 : false;
  }

  /**
   * Set the always active state of the command block.
   * @param value The always active state to set.
   */
  public async setAlwaysActive(value: boolean): Promise<void> {
    // Create the always active NBT tag
    const alwaysActive = new ByteTag({ name: "auto", value: value ? 1 : 0 });

    // Set the always active NBT tag
    await this.block.nbt.set("auto", alwaysActive);
  }

  public getPowered(): boolean {
    // Get the powered from the NBT data
    const powered = this.block.nbt.get<ByteTag>("powered");

    // Return the powered if it exists
    return powered ? powered.value === 1 : false;
  }

  public async setPowered(value: boolean): Promise<void> {
    // Create the powered NBT tag
    const powered = new ByteTag({ name: "powered", value: value ? 1 : 0 });

    // Set the powered NBT tag
    await this.block.nbt.set("powered", powered);
  }
}

export { BlockCommandBlockTrait };
