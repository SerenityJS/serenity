import {
  ByteTag,
  CompoundTag,
  ListTag,
  StringTag,
  TagType
} from "@serenityjs/nbt";

import { BlockIdentifier } from "../../../enums";
import { BlockType } from "../../../block";

import { ItemTypeComponent } from "./component";

import type { ItemType } from "../type";

interface ItemTypeBlockPlacerComponentOptions {
  /**
   * The block type that the item type will place.
   */
  blockType: BlockType;

  /**
   * Whether the block image should be used as the item icon.
   */
  useBlockAsIcon: boolean;

  /**
   * The blocks that this item can be used on.
   */
  useOnBlocks: Array<BlockIdentifier | string>;
}

class ItemTypeBlockPlacerComponent extends ItemTypeComponent {
  public static readonly identifier = "minecraft:block_placer";

  /**
   * The block type that the item type will place.
   */
  protected blockType: BlockType | null = null;

  /**
   * Create a new block placer component for an item type.
   * @param type The item type that the component will be attached to.
   * @param properties The properties of the block placer component.
   */
  public constructor(
    type: ItemType,
    options?: Partial<ItemTypeBlockPlacerComponentOptions>
  ) {
    super(type);

    // Set the block placer properties.
    this.setBlockType(options?.blockType ?? BlockType.get(BlockIdentifier.Air));
    this.setUseBlockAsIcon(options?.useBlockAsIcon ?? true);
    this.setUseOnBlocks(options?.useOnBlocks ?? []);
  }

  /**
   * Get the block type that the item type will place.
   * @returns The block type that the item type will place.
   */
  public getBlockType(): BlockType {
    return this.blockType ?? BlockType.get(BlockIdentifier.Air);
  }

  /**
   * Set the block type that the item type will place.
   * @param value The block type or block identifier.
   */
  public setBlockType(type: BlockType): void {
    // Set the block type.
    this.blockType = type;

    // Create a new block tag.
    this.component.createStringTag({
      name: "block",
      value: type.identifier
    });
  }

  /**
   * Get the whether the block image should be used as the item icon.
   * @returns Whether the block image is the item icon.
   */
  public getUseBlockAsIcon(): boolean {
    return this.component.getTag<ByteTag>("canUseBlockAsIcon")?.value === 1;
  }

  /**
   * Set the whether the block image should be used as the item icon.
   * @param value Whether the block image is the item icon.
   */
  public setUseBlockAsIcon(value: boolean): void {
    // Create a new block tag.
    this.component.createByteTag({
      name: "canUseBlockAsIcon",
      value: value ? 1 : 0
    });
  }

  /**
   * Get the blocks that this item can be used on.
   * @returns The blocks that this item can be used on.
   */
  public getUseOnBlocks(): Array<BlockIdentifier | string> {
    // Get the use on tag.
    const useOn =
      this.component.getTag<ListTag<CompoundTag<unknown>>>("use_on");

    // Return the block identifiers.
    return useOn.value.map((tag) => {
      return tag.getTag<StringTag>("name")?.value as BlockIdentifier;
    });
  }

  /**
   * Set the blocks that this item can be used on.
   * @param value The blocks that this item can be used on.
   */
  public setUseOnBlocks(value: Array<BlockIdentifier | string>): void {
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
}

export { ItemTypeBlockPlacerComponent, ItemTypeBlockPlacerComponentOptions };
