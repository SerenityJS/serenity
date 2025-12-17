import { CompoundTag, IntTag, ListTag, StringTag } from "@serenityjs/nbt";

import { CustomBlockProperties } from "../../types";
import { BlockIdentifier, ItemCategory } from "../../enums";
import { BlockPermutation, BlockState } from "../..";

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
    this.properties.add(new IntTag(0, "molangVersion"));

    // Create a compound tag for the block data.
    const data = this.properties.add(new CompoundTag("vanilla_block_data"));

    // Add the block ID to the block data.
    data.add(new IntTag(this.networkId, "block_id"));

    // Create a compound tag for the menu category.
    const menuCategory = this.properties.add(new CompoundTag("menu_category"));

    // Add the category to the menu category.
    menuCategory.add(
      new StringTag(
        properties?.creativeCategory ?? ItemCategory.Construction,
        "category"
      )
    );

    // Add the group to the menu category.
    if (properties?.creativeGroup) {
      menuCategory.add(new StringTag(properties.creativeGroup, "group"));
    }

    // Create a list tag for the properties.
    this.properties.add(new ListTag<CompoundTag>([], "properties"));

    // Create a list tag for the permutations.
    this.properties.add(new ListTag<CompoundTag>([], "permutations"));
  }

  /**
   * Creates a new block permutation for the block type.
   * @param state The state of the block. `{ [key: string]: string | number | boolean }`
   * @param components The components of the block permutation.
   * @param query The molang query for the block permutation. If not provided, the query will be generated from the state.
   * @returns The block permutation that was created using the state definition.
   */
  public createPermutation(
    state: BlockState,
    components?: Partial<BlockTypeComponentCollection>,
    query?: string
  ): BlockPermutation {
    return BlockPermutation.create(this, state, components, query);
  }
}

export { CustomBlockType };
