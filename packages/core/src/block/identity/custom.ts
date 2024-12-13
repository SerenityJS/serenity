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

  // public createGroup(permutation: BlockPermutation): ComponentGroup {
  //   // Check if the provided permutation is apart of the block type.
  //   if (permutation.type !== this)
  //     throw new Error(
  //       "The provided permutation is not apart of the block type."
  //     );

  //   // Get the keys of the block state.
  //   const keys = Object.keys(permutation.state) as Array<
  //     keyof typeof permutation.state
  //   >;

  //   // Create the MolangQuery for the permutation.
  //   let query: string = "";
  //   for (const key of keys) {
  //     // Get the value of the block state.
  //     let value = permutation.state[key] as unknown;

  //     // Update the value if it is a string.
  //     value = typeof value === "string" ? `'${value}'` : value;

  //     // Append the query for the block state.
  //     query += `query.block_state('${key}') == ${value}`;

  //     // Check if a conjunction is needed.
  //     if (keys.indexOf(key) !== keys.length - 1) query += " && ";
  //   }

  //   // Check if the block type already has a permutation with the same condition query.
  //   if (
  //     this.nbt.value.permutations?.value.some(
  //       (p) => p.value.condition.value === query
  //     )
  //   )
  //     throw new Error(
  //       "The block type already has a permutation with the same condition query."
  //     );

  //   // Create a new permutation tag.
  //   const tag = new CompoundTag<CustomBlockPermutation>();

  //   // Create the condition tag for the permutation.
  //   tag.createStringTag({ name: "condition", value: query });

  //   // Create a new component group for the permutation.
  //   const group = new ComponentGroup({ name: "components" });

  //   // Add the component group to the permutation.
  //   tag.addTag(group);

  //   // Add the permutation to the block type.
  //   this.nbt.value.permutations?.push(tag);

  //   // Return the components tag for the permutation.
  //   return group;
  // }

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
