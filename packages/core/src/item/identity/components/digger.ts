import {
  ByteTag,
  CompoundTag,
  IntTag,
  ListTag,
  StringTag
} from "@serenityjs/nbt";

import { BlockType } from "../../../block";
import { BlockIdentifier } from "../../../enums";
import { ItemType } from "../type";

import { ItemTypeComponent } from "./component";

interface ItemTypeDiggerComponentOptions {
  /**
   * Determines if the `efficiency` enchantment will affect the item.
   */
  useEfficiency: boolean;

  /**
   * The different block types that the item can destroy.
   */
  destroySpeeds: Array<Partial<ItemTypeDiggerDestroySpeed>>;
}

interface ItemTypeDiggerDestroySpeed {
  /**
   * The block type that the item can destroy.
   */
  type?: BlockType;

  /**
   * The block tags that the item can destroy.
   */
  tags?: Array<string>;

  /**
   * The speed at which the item can destroy the block.
   */
  speed: number;
}

class ItemTypeDiggerComponent extends ItemTypeComponent {
  public static readonly identifier = "minecraft:digger";

  /**
   * Create a new digger component for an item type.
   * @param type The item type that the component will be attached to.
   * @param options The options for the digger component.
   */
  public constructor(
    type: ItemType,
    options?: Partial<ItemTypeDiggerComponentOptions>
  ) {
    super(type);

    // Set the default values for the digger component
    this.setUseEfficiency(options?.useEfficiency ?? true);
    this.setDestructionSpeeds(options?.destroySpeeds ?? []);
  }

  /**
   * Get whether the `efficiency` enchantment will affect the item.
   * @returns True if the `efficiency` enchantment will affect the item, false otherwise.
   */
  public getUseEfficiency(): boolean {
    // Get the use efficiency property
    const { value } = this.component.getTag<ByteTag>("use_efficiency");

    // Return true if the value is 1, false otherwise
    return value === 1;
  }

  /**
   * Set whether the `efficiency` enchantment will affect the item.
   * @param value True if the `efficiency` enchantment will affect the item, false otherwise.
   */
  public setUseEfficiency(value: boolean): void {
    // Set the use efficiency property
    this.component.createByteTag({
      name: "use_efficiency",
      value: value ? 1 : 0
    });
  }

  /**
   * Get the destruction speeds of the item.
   * @returns An array of destruction speeds.
   */
  public getDestructionSpeeds(): Array<ItemTypeDiggerDestroySpeed> {
    // Get the destroy speeds property
    const { value } =
      this.component.getTag<ListTag<CompoundTag<unknown>>>("destroy_speeds");

    // Map the destroy speeds to the correct type
    return value.map((tag) => {
      // Get the block tag from the root
      const block = tag.getTag<CompoundTag<unknown>>("block");

      // Get the block type from the block tag
      const identifier = block.getTag<StringTag>("name")?.value;

      // Parse the molang query to get the tags
      const regex = block
        .getTag<StringTag>("tags")
        ?.value.match(/(?:q|query)\.any_tag\(([^)]+)\)/);

      // Filter the tags to get the block tags
      const tags: Array<string> = regex?.[1] ? regex[1].split(",") : [];

      // Remove the quotes from the tags
      for (let i = 0; i < tags.length; i++)
        tags[i] = tags[i]!.replace(/'/g, "").trim();

      // Get the speed tag from the root
      const speed = tag.getTag<IntTag>("speed")?.value ?? 0;

      // Check if the identifier is valid
      if (identifier.length > 0)
        return {
          speed,
          tags,
          type: BlockType.get(identifier as BlockIdentifier)
        };

      // If the identifier is not valid, return an empty object
      return {
        speed,
        tags
      };
    });
  }

  /**
   * Set the destruction speeds of the item.
   * @param speeds An array of destruction speeds.
   */
  public setDestructionSpeeds(
    speeds: Array<Partial<ItemTypeDiggerDestroySpeed>>
  ): void {
    // Create a new list tag for the destroy speeds
    const list = this.component.createListTag<CompoundTag<unknown>>({
      name: "destroy_speeds",
      listType: CompoundTag.type
    });

    // Iterate over the speeds and add them to the list
    for (const speed of speeds) {
      // Create a new root compound tag for the speed
      const root = new CompoundTag<unknown>();

      // Create a new compound tag for the block
      const block = root.createCompoundTag({ name: "block" });

      block.createStringTag({
        name: "name",
        value: speed.type?.identifier ?? String()
      });

      // Create a new molang query for the block tags
      const query = speed.tags
        ? `query.any_tag(${speed.tags.map((x) => `'${x}'`)})`
        : "";

      // Create a new string tag for the block tags
      block.createStringTag({
        name: "tags",
        value: query
      });

      // Create a new int tag for the speed
      root.createIntTag({ name: "speed", value: speed.speed ?? 0 });

      // Add the tag to the list
      list.push(root);
    }
  }
}

export { ItemTypeDiggerComponent, ItemTypeDiggerComponentOptions };
