import { Uint8, ZigZag } from "@serenityjs/binarystream";

import { Proto, Serialize } from "../../decorators";
import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

/**
 * Sent by the client when the player selects a recipe in the stonecutter UI.
 */
@Proto(Packet.ServerboundStonecutterSetRecipe)
class ServerboundStonecutterSetRecipePacket extends DataPacket {
  /**
   * The container id of the stonecutter.
   */
  @Serialize(Uint8) public containerId!: number;

  /**
   * The index of the selected recipe.
   */
  @Serialize(ZigZag) public recipeIndex!: number;
}

export { ServerboundStonecutterSetRecipePacket };
