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
    // Check if the component contains the destroy speeds
    if (!this.component.has("destroy_speeds")) return [];

    // Get the destroy speeds from the component
    const speeds = this.component.get<ListTag<CompoundTag>>("destroy_speeds")!;

    // Prepare a new array to hold the destruction speeds
    const destroySpeeds: Array<ItemTypeDiggerDestroySpeed> = [];

    for (const entry of speeds) {
      // Get the speed from the entry
      const speed = entry.get<IntTag>("speed")?.valueOf() ?? 0;

      // Prepare a block type variable
      let type: BlockType | undefined = undefined;
      let tags: Array<string> | undefined = undefined;

      // Check if the entry has a block tag
      if (entry.has("block")) {
        // Check if the block tag has a name
        const block = entry.get<CompoundTag>("block")!;

        // Check if the block has a name
        if (block.has("name")) {
          // Get the block type from the block tag
          const identifier = block.get<StringTag>("name")?.valueOf() ?? "";

          // Get the block type from the identifier
          type = BlockType.get(identifier as BlockIdentifier);
        }

        // Check if the block has tags
        if (block.has("tags")) {
          // Get the tags from the block tag
          const blockTags = block.get<StringTag>("tags")?.valueOf() ?? "";

          // Parse the tags into an array
          const parsedTags = blockTags.match(/(?:q|query)\.any_tag\(([^)]+)\)/);

          // If the tags were parsed, split them into an array
          if (parsedTags && parsedTags[1]) {
            // Split the tags by comma and remove quotes
            tags = parsedTags[1]
              .split(",")
              .map((tag) => tag.replace(/'/g, "").trim());
          }
        }
      }

      // Add the destruction speed to the array
      destroySpeeds.push({
        speed,
        type,
        tags
      });
    }

    // Return the destruction speeds
    return destroySpeeds;
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

      // Create a new int tag for the speed
      root.add(new IntTag(speed.speed ?? 0, "speed"));

      // Check if the type or tags are defined
      if (speed.type || speed.tags) {
        // Create a new block compound tag for the speed
        const block = new CompoundTag("block");

        // Check if the type is defined and add it to the block tag
        if (speed.type) block.add(new StringTag(speed.type.identifier, "name"));

        // Check if the tags are defined
        if (speed.tags && speed.tags.length > 0) {
          // Create a new molang query for the block tags
          const query = speed.tags
            ? `query.any_tag(${speed.tags.map((x) => `'${x}'`)})`
            : "";

          // Create a new string tag for the block tags
          block.add(new StringTag(query, "tags"));
        }

        // Add the block tag to the root
        root.add(block);
      }

      // Add the tag to the list
      list.push(root);
    }
  }
}

export { ItemTypeDiggerComponent, ItemTypeDiggerComponentOptions };
