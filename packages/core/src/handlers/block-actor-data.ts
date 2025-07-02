import { BlockActorDataPacket, Packet } from "@serenityjs/protocol";
import { Connection } from "@serenityjs/raknet";
import { CompoundTag, StringTag } from "@serenityjs/nbt";

import { NetworkHandler } from "../network";
import { BlockSignTrait } from "../block";

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

      // Check if the packet has a front text
      if (packet.nbt.has("FrontText")) {
        // Get the front text from the packet NBT
        const frontText = packet.nbt.get<CompoundTag>("FrontText")!;

        // Get the text from the front text
        const text = frontText.get<StringTag>("Text")?.valueOf() ?? "";

        // Set the front text on the sign trait
        signTrait.setFrontText(text);
      }

      // Check if the packet has a back text
      if (packet.nbt.has("BackText")) {
        // Get the back text from the packet NBT
        const backText = packet.nbt.get<CompoundTag>("BackText")!;

        // Get the text from the back text
        const text = backText.get<StringTag>("Text")?.valueOf() ?? "";

        // Set the back text on the sign trait
        signTrait.setBackText(text);
      }
    }
  }
}

export { BlockActorDataHandler };
