import { BlockFace, ItemUseMethod } from "@serenityjs/protocol";

import { BlockIdentifier, ItemIdentifier } from "../../enums";
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

    // Hanging signs place the block of their own name, and are not placed on top of a block
    if (this.item.identifier.endsWith("_hanging_sign")) {
      if (options.face === BlockFace.Top) options.canceled = true;
      return;
    }

    // Check if the target block is interacted from the top or bottom
    if (options.face === BlockFace.Top) {
      // Update the placing block to a standing sign
      options.placingBlock = this.getStandingSignType(player.world);
    } else if (options.face === BlockFace.Bottom) {
      // Signs are not placed under a block
      options.canceled = true;
    } else {
      // Update the placing block to a wall sign
      options.placingBlock = this.getWallSignType(player.world);
    }
  }

  /**
   * Get the kind of wood the sign is made of, as the sign blocks name it.
   * Oak signs have no kind in their block names, and dark oak signs name it darkoak.
   * @returns The kind of wood, or null for oak.
   */
  private getWoodType(): string | null {
    // Check if the sign is an oak sign or a dark oak sign
    if (this.item.identifier === ItemIdentifier.OakSign) return null;
    if (this.item.identifier === ItemIdentifier.DarkOakSign) return "darkoak";

    // Extract the kind of wood from the item identifier
    return this.item.identifier.replace("minecraft:", "").replace(/_sign$/, "");
  }

  /**
   * Get the block type for a wall sign based on the item identifier.
   * @param world The world in which the sign is being placed.
   * @returns The block type for the wall sign.
   */
  private getWallSignType(world: World): BlockType {
    // Get the kind of wood the sign is made of
    const type = this.getWoodType();

    // Create the identifier for the wall sign
    const identifier = type
      ? `minecraft:${type}_wall_sign`
      : BlockIdentifier.WallSign;

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
    // Get the kind of wood the sign is made of
    const type = this.getWoodType();

    // Create the identifier for the standing sign
    const identifier = type
      ? `minecraft:${type}_standing_sign`
      : BlockIdentifier.StandingSign;

    // Return the block type from the world block palette or default to StandingSign
    return (
      world.blockPalette.types.get(identifier) ??
      BlockType.get(BlockIdentifier.StandingSign)
    );
  }
}

export { ItemStackSignTrait };
