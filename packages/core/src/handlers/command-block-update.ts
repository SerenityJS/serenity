import { CommandBlockUpdatePacket, Packet } from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";

import { NetworkHandler } from "../network";
import { BlockCommandBlockTrait, BlockPermutation } from "../block";
import { BlockIdentifier } from "../enums";
import { CommandBlockBlock } from "../types";

class CommandBlockUpdateHandler extends NetworkHandler {
  public static readonly packet = Packet.CommandBlockUpdate;

  public async handle(
    packet: CommandBlockUpdatePacket,
    connection: Connection
  ): Promise<void> {
    // Get the player from the connection
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    // Check if the player is an operator
    if (!player.isOp) return;

    if (packet.settings) {
      // Get the block at the position provided by the packet
      const block = await player.dimension.getBlock(packet.settings.position);

      // Get the command block trait from the block
      const trait = block.getTrait(BlockCommandBlockTrait);
      if (!trait) return;

      // Set the command block settings
      await Promise.all([
        trait.setCommand(packet.command),
        trait.setTickDelay(packet.tickDelay),
        trait.setAlwaysActive(!packet.settings.redstoneMode)
      ]);

      // Switch the command mode
      switch (packet.settings.commandMode) {
        case 0: {
          // Get the command block permutation
          const permutation = BlockPermutation.resolve(
            BlockIdentifier.CommandBlock,
            block.permutation.state as CommandBlockBlock
          );

          // Check if the block is already a command block
          if (permutation.type.identifier === block.identifier) return;

          // Set the command block permutation
          return block.setPermutation(permutation, block.getDataEntry());
        }

        case 1: {
          // Get the repeating command block permutation
          const permutation = BlockPermutation.resolve(
            BlockIdentifier.RepeatingCommandBlock,
            block.permutation.state as CommandBlockBlock
          );

          // Check if the block is already a command block
          if (permutation.type.identifier === block.identifier) return;

          // Set the repeating command block permutation
          return block.setPermutation(permutation, block.getDataEntry());
        }

        case 2: {
          // Get the chain command block permutation
          const permutation = BlockPermutation.resolve(
            BlockIdentifier.ChainCommandBlock,
            block.permutation.state as CommandBlockBlock
          );

          // Check if the block is already a command block
          if (permutation.type.identifier === block.identifier) return;

          // Set the chain command block permutation
          return block.setPermutation(permutation, block.getDataEntry());
        }
      }
    }
  }
}

export { CommandBlockUpdateHandler };
