import { BlockFace, ItemUseMethod } from "@serenityjs/protocol";

import { BlockIdentifier } from "../../enums";
import { ItemStackUseOnBlockOptions } from "../types";
import { Player } from "../../entity";
import { BlockType } from "../../block";
import { World } from "../../world";

import { ItemStackTrait } from "./trait";

class ItemStackSignTrait extends ItemStackTrait {
  public static readonly identifier = "minecraft:sign";
  public static readonly tag = "minecraft:sign";

  public onUseOnBlock(
    player: Player,
    options: ItemStackUseOnBlockOptions
  ): void {
    // Check if the event is canceled or if the method is not Place
    if (options.canceled || options.method !== ItemUseMethod.Place) return;

    this.getWallSignType(player.world);

    // Check if the target block is interacted from the top or bottom
    if (options.face === BlockFace.Top || options.face === BlockFace.Bottom) {
      // Update the placing block to a standing sign
      options.placingBlock = this.getStandingSignType(player.world);
    } else {
      // Update the placing block to a wall sign
      options.placingBlock = this.getWallSignType(player.world);
    }
  }

  /**
   * Get the block type for a wall sign based on the item identifier.
   * @param world The world in which the sign is being placed.
   * @returns The block type for the wall sign.
   */
  private getWallSignType(world: World): BlockType {
    // Extract the type from the item identifier
    const split = this.item.identifier.replace("minecraft:", "").split("_");

    // Keep everything except the last part
    const type = split.slice(0, -1).join("_");

    // Create the identifier for the wall sign
    const identifier = `minecraft:${type}_wall_sign` as BlockIdentifier;

    // Return the block type from the world block palette or default to WallSign
    return (
      world.blockPalette.types.get(identifier) ??
      BlockType.get(BlockIdentifier.WallSign)
    );
  }

  /**
   * Get the block type for a standing sign based on the item identifier.
   * @param world The world in which the sign is being placed.
   * @returns The block type for the standing sign.
   */
  private getStandingSignType(world: World): BlockType {
    // Extract the type from the item identifier
    const split = this.item.identifier.replace("minecraft:", "").split("_");

    // Keep everything except the last part
    const type = split.slice(0, -1).join("_");

    // Create the identifier for the standing sign
    const identifier = `minecraft:${type}_standing_sign` as BlockIdentifier;

    // Return the block type from the world block palette or default to StandingSign
    return (
      world.blockPalette.types.get(identifier) ??
      BlockType.get(BlockIdentifier.StandingSign)
    );
  }
}

export { ItemStackSignTrait };
