import { CompoundTag } from "@serenityjs/nbt";
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
  }

  public static toNbt(type: CustomBlockType): CompoundTag {
    // Create a root compound tag for the block type.
    const root = new CompoundTag();

    // Create a compound tag for the block data.
    const vanillaBlockData = root.createCompoundTag("vanilla_block_data");
    vanillaBlockData.createIntTag("block_id", type.networkId); // The block network ID, this should correspond to a matching item type.

    // Create a compound tag for creative inventory data.
    const menuCategoryData = root.createCompoundTag("menu_category");
    menuCategoryData.createStringTag("category", ItemCategory.Nature); // TODO: Add a property for the creative inventory category.
    // menuCategoryData.createStringTag("group", ItemGroup.); // The creative inventory group.

    // Create a compound tag for the Molang data.
    root.createIntTag("molangVersion", 0); // The version of the Molang data, not sure what this indicates on the client end.

    // Return the root compound tag.
    return root;
  }

  /**
   * Convert the custom block type to a block property.
   * @param type The custom block type to convert.
   * @returns The block property.
   */
  public static toBlockProperty(type: CustomBlockType): BlockProperty {
    return new BlockProperty(type.identifier, CustomBlockType.toNbt(type));
  }
}

export { CustomBlockType };
