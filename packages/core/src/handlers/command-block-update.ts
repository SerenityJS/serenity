import {
  CommandBlockMode,
  CommandBlockUpdatePacket,
  Packet
} from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";
import {
  BlockCommandBlockTrait,
  BlockLevelStorage,
  BlockPermutation
} from "../block";
import { BlockIdentifier } from "../enums";

class CommandBlockUpdateHandler extends NetworkHandler {
  public static readonly packet = Packet.CommandBlockUpdate;

  /**
   * The command block of each command block mode.
   */
  private static readonly modes: Record<CommandBlockMode, BlockIdentifier> = {
    [CommandBlockMode.Impulse]: BlockIdentifier.CommandBlock,
    [CommandBlockMode.Repeating]: BlockIdentifier.RepeatingCommandBlock,
    [CommandBlockMode.Chain]: BlockIdentifier.ChainCommandBlock
  };

  public handle(
    packet: CommandBlockUpdatePacket,
    connection: Connection
  ): void {
    // Get the player from the connection
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    // Check if the player is an operator
    if (!player.isOp) return;

    // Check if the packet updates a command block, rather than a command block minecart
    const settings = packet.settings;
    if (!settings) return;

    // Get the block at the position provided by the packet
    const block = player.dimension.getBlock(settings.position);

    // Check if the block is a command block
    if (!block.getTrait(BlockCommandBlockTrait)) return;

    // Change the command block to the one of its mode, keeping its settings
    const identifier = CommandBlockUpdateHandler.modes[settings.commandMode];
    if (identifier && identifier !== block.identifier) {
      // Copy the storage of the command block, as changing its type clears it
      const storage = new BlockLevelStorage(
        block.getChunk(),
        block.getStorage()
      );

      // Get the permutation of the new command block, in the same state
      const permutation = BlockPermutation.resolve(
        identifier,
        block.permutation.state
      );

      // Set the permutation of the block with the copied storage
      block.setPermutation(permutation, storage);
    }

    // Set whether the command block is conditional
    if (block.getState<boolean>("conditional_bit") !== settings.conditionalMode)
      block.setState("conditional_bit", settings.conditionalMode);

    // Get the command block trait from the block, which is new if its type changed
    const trait = block.getTrait(BlockCommandBlockTrait);
    if (!trait) return;

    // Set the command block settings
    trait.setCommand(packet.command);
    trait.setCustomName(packet.customName);
    trait.setTickDelay(packet.tickDelay);
    trait.setTrackOutput(packet.trackOutput);
    trait.setExecuteOnFirstTick(packet.executeFirstTick);
    trait.setAlwaysActive(!settings.redstoneMode);

    // Clear the last output if the command block no longer tracks it
    if (!packet.trackOutput) trait.setLastOutput("");
  }
}

export { CommandBlockUpdateHandler };
