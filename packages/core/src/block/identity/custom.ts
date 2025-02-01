import { TagType } from "@serenityjs/nbt";

import { CustomBlockProperties, GenericBlockState } from "../../types";
import { BlockIdentifier, ItemCategory } from "../../enums";
import { BlockPermutation } from "../..";

import { BlockType } from "./type";
import { BlockTypeComponentCollection } from "./collection";

class CustomBlockType extends BlockType {
  protected static networkId = 10000; // Start at 10000 to avoid conflicts with vanilla block types.

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
    this.properties.createIntTag({ name: "molangVersion", value: 0 });

    // Create a compound tag for the block data.
    const data = this.properties.createCompoundTag({
      name: "vanilla_block_data"
    });

    // Add the block ID to the block data.
    data.createIntTag({ name: "block_id", value: this.networkId });

    // Create a compound tag for the menu category.
    const menuCategory = this.properties.createCompoundTag({
      name: "menu_category"
    });

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

    // Create a list tag for the properties.
    this.properties.createListTag({
      name: "properties",
      listType: TagType.Compound
    });

    // Create a list tag for the permutations.
    this.properties.createListTag({
      name: "permutations",
      listType: TagType.Compound
    });
  }

  /**
   * Creates a new block permutation for the block type.
   * @param state The state of the block. `{ [key: string]: string | number | boolean }`
   * @param components The components of the block permutation.
   * @returns The block permutation that was created using the state definition.
   */
  public createPermutation(
    state: GenericBlockState,
    components?: Partial<BlockTypeComponentCollection>
  ): BlockPermutation {
    return BlockPermutation.create(this, state, components);
  }
}

export { CustomBlockType };
