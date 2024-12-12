import { ByteTag, CompoundTag } from "@serenityjs/nbt";
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
   * The NBT data of the custom block type.
   */
  public readonly vanillaComponents = new CompoundTag({ name: "components" });

  /**
   * The light emission of the block type.
   */
  public get lightEmission(): number {
    // Check if the type has a destructible by light emission
    if (!this.vanillaComponents.hasTag("minecraft:light_emission")) return 0;

    // Get the destructible by light emission
    const tag = this.vanillaComponents.getTag<CompoundTag<unknown>>(
      "minecraft:light_emission"
    );

    // Return the hardness value.
    return tag?.getTag<ByteTag>("emission")?.value ?? 0;
  }

  /**
   * The light emission of the block type.
   */
  public set lightEmission(value: number) {
    // Create a compound tag for the destructible by light emission
    const tag = this.vanillaComponents.createCompoundTag({
      name: "minecraft:light_emission"
    });

    // Add the hardness property to the destructible by light emission
    tag.createByteTag({ name: "emission", value });
  }

  /**
   * The light dampening of the block type.
   */
  public get lightDampening(): number {
    // Check if the type has a destructible by light emission
    if (!this.vanillaComponents.hasTag("minecraft:light_dampening")) return 0;

    // Get the destructible by light emission
    const tag = this.vanillaComponents.getTag<CompoundTag<unknown>>(
      "minecraft:light_dampening"
    );

    // Return the hardness value.
    return tag?.getTag<ByteTag>("lightLevel")?.value ?? 0;
  }

  /**
   * The light dampening of the block type.
   */
  public set lightDampening(value: number) {
    // Create a compound tag for the destructible by light emission
    const tag = this.vanillaComponents.createCompoundTag({
      name: "minecraft:light_dampening"
    });

    // Add the hardness property to the destructible by light emission
    tag.createByteTag({ name: "lightLevel", value });
  }

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

    // Check if hardness is defined in the properties.
    if (properties?.hardness) {
      // Create a compound tag for the destructible by mining component.
      const tag = this.vanillaComponents.createCompoundTag({
        name: "minecraft:destructible_by_mining"
      });

      // Add the hardness property to the destructible by mining component.
      tag.createFloatTag({ name: "value", value: properties.hardness });
    }

    // Check if friction is defined in the properties.
    if (properties?.friction) {
      // Create a compound tag for the friction component.
      const tag = this.vanillaComponents.createCompoundTag({
        name: "minecraft:friction"
      });

      // Add the friction property to the friction component.
      tag.createFloatTag({ name: "value", value: properties.friction });
    }
  }

  public static toNbt(type: CustomBlockType): CompoundTag<unknown> {
    // Create a root compound tag for the block type.
    const root = new CompoundTag();

    // Add the nbt data to the root compound tag.
    root.addTag(type.vanillaComponents);

    // Create a compound tag for the block data.
    const vanillaBlockData = root.createCompoundTag({
      name: "vanilla_block_data"
    });

    vanillaBlockData.createIntTag({ name: "block_id", value: type.networkId }); // The block network ID, this should correspond to a matching item type.

    // Create a compound tag for creative inventory data.
    const menuCategoryData = root.createCompoundTag({ name: "menu_category" });
    menuCategoryData.createStringTag({
      name: "category",
      value: ItemCategory.Nature
    }); // TODO: Add a property for the creative inventory category.
    // menuCategoryData.createStringTag("group", ItemGroup.); // The creative inventory group.

    // Create a compound tag for the Molang data.
    root.createIntTag({ name: "molangVersion", value: 0 }); // The version of the Molang data, not sure what this indicates on the client end.

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
