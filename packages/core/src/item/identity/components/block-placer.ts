import {
  ByteTag,
  CompoundTag,
  ListTag,
  StringTag,
  TagType
} from "@serenityjs/nbt";

import { BlockIdentifier } from "../../../enums";
import { ItemType } from "../type";

import { ItemTypeComponent } from "./component";

class ItemTypeBlockPlacerComponent extends ItemTypeComponent {
  public static readonly identifier = "minecraft:block_placer";

  /**
   * The block type that the item type will place when used.
   */
  public get blockIdentifier(): BlockIdentifier | string {
    // Get the block identifier from the block tag.
    return this.component.getTag<StringTag>("block")?.value as BlockIdentifier;
  }

  /**
   * The block type that the item type will place when used.
   */
  public set blockIdentifier(value: BlockIdentifier | string) {
    // Create a new block tag.
    this.component.createStringTag({
      name: "block",
      value: value
    });
  }

  /**
   * Whether the block image should be used as the item icon.
   */
  public get useBlockAsIcon(): boolean {
    return this.component.getTag<ByteTag>("canUseBlockAsIcon")?.value === 1;
  }

  /**
   * Whether the block image should be used as the item icon.
   */
  public set useBlockAsIcon(value: boolean) {
    this.component.createByteTag({
      name: "canUseBlockAsIcon",
      value: value ? 1 : 0
    });
  }

  /**
   * The block types that the item type can be used on.
   * If the query is empty, the item can be used on any block.
   */
  public get useOn(): Array<BlockIdentifier | string> {
    // Get the use on tag.
    const useOn =
      this.component.getTag<ListTag<CompoundTag<unknown>>>("use_on");

    // Return the block identifiers.
    return useOn.value.map((tag) => {
      return tag.getTag<StringTag>("name")?.value as BlockIdentifier;
    });
  }

  /**
   * The block types that the item type can be used on.
   * If the query is empty, the item can be used on any block.
   */
  public set useOn(value: Array<BlockIdentifier | string>) {
    // Create the use on list tag.
    const useOn = this.component.createListTag({
      name: "use_on",
      listType: TagType.Compound
    });

    for (const block of value) {
      // Create the block tag.
      const tag = new CompoundTag({});

      // Set the block name.
      tag.createStringTag({ name: "name", value: block });

      // Add the block to the use on list.
      useOn.push(tag);
    }

    // Set the use on list to the component.
    this.component.setTag("use_on", useOn);
  }

  /**
   * Create a new block placer component for an item type.
   * @param type The item type that the component will be attached to.
   * @param properties The properties of the block placer component.
   */
  public constructor(
    type: ItemType,
    properties?: Partial<ItemTypeBlockPlacerComponent>
  ) {
    super(type);

    // Get the block identifier from the properties.
    const identifier = type.blockType?.identifier ?? BlockIdentifier.Air;

    // Set the block placer properties.
    this.blockIdentifier = properties?.blockIdentifier ?? identifier;
    this.useBlockAsIcon = properties?.useBlockAsIcon ?? true;
    this.useOn = properties?.useOn ?? [];
  }
}

export { ItemTypeBlockPlacerComponent };
