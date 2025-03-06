import {
  ContainerId,
  ContainerOpenPacket,
  ContainerType
} from "@serenityjs/protocol";
import { StringTag } from "@serenityjs/nbt";

import { BlockInteractionOptions } from "../..";
import { BlockIdentifier } from "../../enums";

import { BlockTrait } from "./trait";

class BlockCommandBlockTrait extends BlockTrait {
  public static readonly identifier = "command_block";
  public static readonly types = [BlockIdentifier.CommandBlock];

  /**
   * The command that is inputted into the command block.
   */
  public get command(): string {
    // Get the command from the NBT data
    const command = this.block.nbt.get<StringTag>("Command");

    // Return the command if it exists
    return command ? command.value : "";
  }

  /**
   * The command that is inputted into the command block.
   */
  public set command(value: string) {
    // Create the command NBT tag
    const command = new StringTag({ name: "Command", value });

    // Set the command NBT tag
    this.block.nbt.set("Command", command);
  }

  public onInteract({ origin, cancel }: BlockInteractionOptions): void {
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
}

export { BlockCommandBlockTrait };
