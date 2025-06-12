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
    const component = this.component.get<ByteTag>("use_efficiency");

    // Return true if the value is 1, false otherwise
    return component?.valueOf() === 1;
  }

  /**
   * Set whether the `efficiency` enchantment will affect the item.
   * @param value True if the `efficiency` enchantment will affect the item, false otherwise.
   */
  public setUseEfficiency(value: boolean): void {
    // Set the use efficiency property
    this.component.add(new ByteTag(value ? 1 : 0, "use_efficiency"));
  }

  /**
   * Get the destruction speeds of the item.
   * @returns An array of destruction speeds.
   */
  public getDestructionSpeeds(): Array<ItemTypeDiggerDestroySpeed> {
    // Get the destroy speeds property
    const component =
      this.component.get<ListTag<CompoundTag>>("destroy_speeds")!;

    // Map the destroy speeds to the correct type
    return component.map((tag) => {
      // Get the block tag from the root
      const block = tag.get<CompoundTag>("block")!;

      // Get the block type from the block tag
      const identifier = block.get<StringTag>("name")?.valueOf() ?? "";

      // Parse the molang query to get the tags
      const regex = block
        .get<StringTag>("tags")
        ?.valueOf()
        .match(/(?:q|query)\.any_tag\(([^)]+)\)/);

      // Filter the tags to get the block tags
      const tags: Array<string> = regex?.[1] ? regex[1].split(",") : [];

      // Remove the quotes from the tags
      for (let i = 0; i < tags.length; i++)
        tags[i] = tags[i]!.replace(/'/g, "").trim();

      // Get the speed tag from the root
      const speed = tag.get<IntTag>("speed")?.valueOf() ?? 0;

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
    const list = new ListTag<CompoundTag>([], "destroy_speeds");

    // Add the list to the component
    this.component.add(list);

    // Iterate over the speeds and add them to the list
    for (const speed of speeds) {
      // Create a new root compound tag for the speed
      const root = new CompoundTag();

      // Create a new block compound tag for the speed
      const block = new CompoundTag();

      // Create a new string tag for the block type
      block.add(new StringTag(speed.type?.identifier ?? "", "name"));

      // Create a new molang query for the block tags
      const query = speed.tags
        ? `query.any_tag(${speed.tags.map((x) => `'${x}'`)})`
        : "";

      // Create a new string tag for the block tags
      block.add(new StringTag(query, "tags"));

      // Create a new int tag for the speed
      root.add(new IntTag(speed.speed ?? 0, "speed"));

      // Add the block tag to the root
      root.add(block);

      // Add the tag to the list
      list.push(root);
    }
  }
}

export { ItemTypeDiggerComponent, ItemTypeDiggerComponentOptions };
