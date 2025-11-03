import { BlockActorDataPacket, Packet } from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";
import { CompoundTag, StringTag } from "@serenityjs/nbt";

import { NetworkHandler } from "../network";
import { BlockSignTrait } from "../block";
import { PlayerEditSignSignal } from "../events";

class BlockActorDataHandler extends NetworkHandler {
  public static readonly packet = Packet.BlockActorData;

  public handle(packet: BlockActorDataPacket, connection: Connection): void {
    // Get the player from the connection
    const player = this.serenity.getPlayerByConnection(connection);
    if (!player) return connection.disconnect();

    // Get the block from the packet position
    const block = player.dimension.getBlock(packet.position);

    // Check if the block is a sign
    if (block.hasTrait(BlockSignTrait)) {
      // Get the sign trait from the block
      const signTrait = block.getTrait(BlockSignTrait);

      // Prepare variables for front and back text
      let frontText = "";
      let backText = "";

      // Check if the packet has a front text
      if (packet.nbt.has("FrontText")) {
        // Get the front text from the packet NBT
        const text = packet.nbt.get<CompoundTag>("FrontText")!;

        // Get the text from the front text
        frontText = text.get<StringTag>("Text")?.valueOf() ?? "";
      }

      // Check if the packet has a back text
      if (packet.nbt.has("BackText")) {
        // Get the back text from the packet NBT
        const text = packet.nbt.get<CompoundTag>("BackText")!;

        // Get the text from the back text
        backText = text.get<StringTag>("Text")?.valueOf() ?? "";
      }

      // Create a new signal & assign the texts
      const signal = new PlayerEditSignSignal(player, block);
      signal.frontText = frontText;
      signal.backText = backText;

      // Emit the signal
      if (!signal.emit()) {
        // Revert the sign texts to their original values
        signTrait.setFrontText(signTrait.getFrontText());
        signTrait.setBackText(signTrait.getBackText());

        // Don't update the sign if the event was cancelled
        return;
      }

      // Update the sign trait with the new texts
      signTrait.setFrontText(signal.frontText);
      signTrait.setBackText(signal.backText);
    }
  }
}

export { BlockActorDataHandler };
