import { Uint8, ZigZag, ZigZong } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

/**
 * Sent by the server when the selected recipe of a stonecutter UI changes.
 */
@Proto(Packet.ClientboundStonecutterSetRecipe)
class ClientboundStonecutterSetRecipePacket extends DataPacket {
  /**
   * The unique actor id of the player using the stonecutter.
   */
  @Serialize(ZigZong) public playerUniqueId!: bigint;

  /**
   * The container id of the stonecutter.
   */
  @Serialize(Uint8) public containerId!: number;

  /**
   * The index of the selected recipe.
   */
  @Serialize(ZigZag) public recipeIndex!: number;
}

export { ClientboundStonecutterSetRecipePacket };
