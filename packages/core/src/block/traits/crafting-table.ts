import { ContainerType } from "@serenityjs/protocol";

import { Block } from "../block";
import { BlockIdentifier } from "../../enums";
import { BlockTypeCraftingTableComponent } from "../identity";

import { BlockInventoryTrait } from "./inventory";

class BlockCraftingTableTrait extends BlockInventoryTrait {
  public static readonly identifier = "crafting_table";
  public static readonly types = [BlockIdentifier.CraftingTable];
  public static readonly component = BlockTypeCraftingTableComponent;

  /**
   * Creates a new block crafting table trait.
   * @param block The block create the trait for.
   */
  public constructor(block: Block) {
    // Get the crafting table component from the block
    const component = block.type.components.getCraftingTable();

    // Call the super constructor
    super(block, {
      size: component.getGridSize() ** 2, // Calculate the size of the crafting table
      type: ContainerType.Workbench
    });
  }
}

export { BlockCraftingTableTrait };
