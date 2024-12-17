import { TagType } from "@serenityjs/nbt";
import { BlockProperty } from "@serenityjs/protocol";

import { BlockTypeProperties } from "../../types";
import { BlockIdentifier, ItemCategory } from "../../enums";

import { BlockType } from "./type";

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
    properties?: Partial<BlockTypeProperties>
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
    // menuCategoryData.createStringTag("group", ItemGroup.); // The creative inventory group.

    // Add the category to the menu category.
    menuCategory.createStringTag({
      name: "category",
      value: ItemCategory.Nature
    });

    // Create a compound tag for the components.
    this.nbt.createCompoundTag({ name: "components" });

    // Create a list tag for the properties.
    this.nbt.createListTag({ name: "properties", listType: TagType.Compound });

    // Create a list tag for the permutations.
    this.nbt.createListTag({
      name: "permutations",
      listType: TagType.Compound
    });
  }

  /**
   * Convert the custom block type to a block property.
   * @param type The custom block type to convert.
   * @returns The block property.
   */
  public static toBlockProperty(type: CustomBlockType): BlockProperty {
    return new BlockProperty(type.identifier, type.nbt);
  }
}

export { CustomBlockType };
