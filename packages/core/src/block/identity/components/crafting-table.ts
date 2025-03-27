import { IntTag, StringTag } from "@serenityjs/nbt";

import { BlockType } from "../type";
import { BlockPermutation } from "../permutation";

import { BlockTypeComponent } from "./component";

const DefaultCraftingTableProperties = {
  tableName: "Custom Crafting Table",
  gridSize: 3
};

class BlockTypeCraftingTableComponent extends BlockTypeComponent {
  public static readonly identifier = "minecraft:crafting_table";

  /**
   * The table name of the crafting table.
   */
  public get tableName(): string {
    // Get the origin of the crafting table
    return this.component.getTag<StringTag>("table_name")?.value ?? "";
  }

  /**
   * The table name of the crafting table.
   */
  public set tableName(value: string) {
    // Set the origin of the crafting table
    this.component.createStringTag({ name: "table_name", value });
  }

  /**
   * The grid size of the crafting table.
   * This value is then raised to the power of 2 to get the size of the grid.
   */
  public get gridSize(): number {
    // Get the size of the crafting table
    return this.component.getTag<IntTag>("grid_size")?.value ?? 0;
  }

  /**
   * The grid size of the crafting table.
   * This value is then raised to the power of 2 to get the size of the grid.
   */
  public set gridSize(value: number) {
    // Set the size of the crafting table
    this.component.createIntTag({ name: "grid_size", value });
  }

  /**
   * Create a new block crafting table component for a block definition
   * @param block The block type or permutation
   * @param properties The crafting table properties
   */
  public constructor(
    block: BlockType | BlockPermutation,
    properties?: Partial<BlockTypeCraftingTableComponent>
  ) {
    super(block);

    // Assign the default crafting table properties
    Object.assign(this, { ...DefaultCraftingTableProperties, ...properties });
  }
}

export { BlockTypeCraftingTableComponent };
