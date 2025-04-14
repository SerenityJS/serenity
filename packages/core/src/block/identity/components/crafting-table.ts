import { IntTag, ListTag, StringTag } from "@serenityjs/nbt";

import { BlockTypeComponent } from "./component";

import type { BlockType } from "../type";
import type { BlockPermutation } from "../permutation";

interface BlockTypeCraftingTableComponentOptions {
  /**
   * The name of the crafting table that is displayed in the container ui.
   */
  table_name: string;

  /**
   * The crafting tags of the crafting table, these are the recipes that are available.
   */
  crafting_tags: Array<string>;

  /**
   * The grid size of the crafting table.
   */
  grid_size: number;
}

class BlockTypeCraftingTableComponent extends BlockTypeComponent {
  public static readonly identifier = "minecraft:crafting_table";

  /**
   * Create a new block crafting table component for a block definition.
   * @param block The block type or permutation.
   * @param options The options for the crafting table.
   */
  public constructor(
    block: BlockType | BlockPermutation,
    options?: Partial<BlockTypeCraftingTableComponentOptions>
  ) {
    super(block);

    // Assign the default values for the crafting table
    this.setTableName(options?.table_name ?? this.type.identifier);
    this.setCraftingTags(options?.crafting_tags ?? []);
    this.setGridSize(options?.grid_size ?? 3);
  }

  /**
   * Get the table name of the crafting table component.
   * @returns The table name of the crafting table component.
   */
  public getTableName(): string {
    // Get the table name of the crafting table
    return this.component.getTag<StringTag>("table_name")?.value ?? "";
  }

  /**
   * Set the table name of the crafting table component.
   * @param value The table name of the crafting table component.
   */
  public setTableName(value: string): void {
    // Set the table name of the crafting table
    this.component.createStringTag({ name: "table_name", value });
  }

  /**
   * Get the crafting tags of the crafting table.
   * @returns An array of crafting tags of the crafting table.
   */
  public getCraftingTags(): Array<string> {
    // Get the crafting tags of the crafting table
    const tag = this.component.getTag<ListTag<StringTag>>("crafting_tags");

    // Return the crafting tags of the crafting table
    return tag?.value.map((tag) => tag.value) ?? [];
  }

  /**
   * Set the crafting tags of the crafting table.
   * @param value An array of crafting tags of the crafting table.
   */
  public setCraftingTags(value: Array<string>): void {
    // Set the crafting tags of the crafting table
    const tag = this.component.createListTag({
      name: "crafting_tags",
      listType: StringTag.type
    });

    // Set the crafting tags of the crafting table
    for (const tagValue of value) {
      tag.push(new StringTag({ value: tagValue }));
    }
  }

  /**
   * Get the grid size of the crafting table.
   * @returns The grid size of the crafting table.
   */
  public getGridSize(): number {
    // Get the grid size of the crafting table
    return this.component.getTag<IntTag>("grid_size")?.value ?? 0;
  }

  /**
   * Set the grid size of the crafting table.
   * @param value The grid size of the crafting table.
   */
  public setGridSize(value: number): void {
    // Set the grid size of the crafting table
    this.component.createIntTag({ name: "grid_size", value });
  }
}

export {
  BlockTypeCraftingTableComponent,
  BlockTypeCraftingTableComponentOptions
};
