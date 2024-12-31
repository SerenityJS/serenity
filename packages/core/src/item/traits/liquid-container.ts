import { Gamemode, ItemUseMethod } from "@serenityjs/protocol";

import { Player } from "../../entity";
import { BlockIdentifier, ItemIdentifier } from "../../enums";
import { ItemUseOnBlockOptions } from "../../types";
import { ItemStack } from "../stack";

import { ItemTrait } from "./trait";

class ItemLiquidContainerTrait<T extends ItemIdentifier> extends ItemTrait<T> {
  public static readonly identifier = "liquid_container";

  public static readonly types = [
    ItemIdentifier.Bucket,
    ItemIdentifier.WaterBucket,
    ItemIdentifier.LavaBucket
  ];

  public onUseOnBlock(
    player: Player,
    options: ItemUseOnBlockOptions
  ): ItemUseMethod | void {
    // Check if the useMethod is unknown
    if (options.method !== ItemUseMethod.Place) return;

    // Switch on the item identifier
    switch (this.item.identifier) {
      case ItemIdentifier.Bucket: {
        // Prepare the itemStack
        let itemStack: ItemStack;

        // Check if the target block is water logged
        if (options.targetBlock.isWaterlogged) {
          // Set the target block as not water logged
          options.targetBlock.isWaterlogged = false;

          // Set the itemStack to a water bucket
          itemStack = new ItemStack(ItemIdentifier.WaterBucket);
        } else {
          // Check if the target block is neither water nor lava
          if (
            options.targetBlock.identifier !== BlockIdentifier.Water &&
            options.targetBlock.identifier !== BlockIdentifier.Lava
          )
            return;

          // Determine the ItemStack to replace the bucket with
          itemStack =
            options.targetBlock.identifier === BlockIdentifier.Water
              ? new ItemStack(ItemIdentifier.WaterBucket)
              : new ItemStack(ItemIdentifier.LavaBucket);

          // Set the target block to air
          options.targetBlock.identifier = BlockIdentifier.Air;
        }

        // Add the itemStack to the player's inventory
        this.item.container?.addItem(itemStack);

        // Return the updated use method
        return ItemUseMethod.FillBucket;
      }

      case ItemIdentifier.WaterBucket: {
        // Check if the target block can be water logged
        if (options.targetBlock.isLoggable) {
          // Set the target block are water logged
          options.targetBlock.isWaterlogged = true;
        }
        // Check if the target block is air
        else if (options.targetBlock.isAir) {
          // Set the target block as water
          options.targetBlock.identifier = BlockIdentifier.Water;
        }
        // If nethier case is matched, get the resultanting block base on the face
        else {
          // Get the resultant block
          const resultant = options.targetBlock.face(options.face);

          // Set the resultant block to water
          resultant.identifier = BlockIdentifier.Water;
        }

        // Check if the player is in creative mode
        if (player.gamemode !== Gamemode.Creative) {
          // Create a new ItemStack to replace the water bucket
          const itemStack = new ItemStack(ItemIdentifier.Bucket);

          // Get the current slot of the item
          const slot = this.item.slot;

          // Set the new ItemStack in the slot
          this.item.container?.setItem(slot, itemStack);
        }

        // Return updated use method
        return ItemUseMethod.PourBucket;
      }

      case ItemIdentifier.LavaBucket: {
        // Check if the target block is air
        if (options.targetBlock.isAir) {
          // Set the target block as lava
          options.targetBlock.identifier = BlockIdentifier.Lava;
        }
        // If nethier case is matched, get the resultanting block base on the face
        else {
          // Get the resultant block
          const resultant = options.targetBlock.face(options.face);

          // Set the resultant block to lava
          resultant.identifier = BlockIdentifier.Lava;
        }

        // Check if the player is in creative mode
        if (player.gamemode !== Gamemode.Creative) {
          // Create a new ItemStack to replace the lava bucket
          const itemStack = new ItemStack(ItemIdentifier.Bucket);

          // Get the current slot of the item
          const slot = this.item.slot;

          // Set the new ItemStack in the slot
          this.item.container?.setItem(slot, itemStack);
        }

        // Return updated use method
        return ItemUseMethod.PourBucket;
      }
    }
  }
}

export { ItemLiquidContainerTrait };
