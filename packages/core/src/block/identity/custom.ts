import { TagType } from "@serenityjs/nbt";

import { CustomBlockProperties, GenericBlockState } from "../../types";
import { BlockIdentifier, ItemCategory } from "../../enums";
import { BlockPermutation } from "../..";

import { BlockType } from "./type";
import { BlockPropertyCollection } from "./property-collection";

class CustomBlockType extends BlockType {
  protected static networkId = 10000; // Start at 10000 to avoid conflicts with vanilla block types.

  /**
   * Indicates that the block type is custom.
   */
  public readonly custom = true;

  /**
   * The network ID of the custom block type.
   */
  public readonly networkId = ++CustomBlockType.networkId;

  /**
   * Creates a new custom block type.
   * @param identifier The identifier of the block type.
   * @param properties The properties of the block type.
   */
  public constructor(
    identifier: string,
    properties?: Partial<CustomBlockProperties>
  ) {
    super(identifier as BlockIdentifier, properties);

    // Create a molang version tag.
    this.nbt.createIntTag({ name: "molangVersion", value: 0 });

    // Create a compound tag for the block data.
    const data = this.nbt.createCompoundTag({ name: "vanilla_block_data" });

    // Add the block ID to the block data.
    data.createIntTag({ name: "block_id", value: this.networkId });

    // Create a compound tag for the menu category.
    const menuCategory = this.nbt.createCompoundTag({ name: "menu_category" });

    // Add the category to the menu category.
    menuCategory.createStringTag({
      name: "category",
      value: properties?.creativeCategory ?? ItemCategory.Construction
    });

    // Add the group to the menu category.
    if (properties?.creativeGroup) {
      menuCategory.createStringTag({
        name: "group",
        value: properties.creativeGroup
      });
    }

    // Add the properties to the root tag.
    this.nbt.addTag(this.properties);

    // Create a list tag for the properties.
    this.nbt.createListTag({ name: "properties", listType: TagType.Compound });

    // Create a list tag for the permutations.
    this.nbt.createListTag({
      name: "permutations",
      listType: TagType.Compound
    });
  }

  /**
   * Creates a new block permutation for the block type.
   * @param state The state of the block. `{ [key: string]: string | number | boolean }`
   * @param properties The properties of the block permutation.
   * @returns The block permutation that was created using the state definition.
   */
  public createPermutation(
    state: GenericBlockState,
    properties?: Partial<BlockPropertyCollection>
  ): BlockPermutation {
    return BlockPermutation.create(this, state, properties);
  }
}

export { CustomBlockType };
