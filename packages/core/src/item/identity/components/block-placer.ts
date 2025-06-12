import { ByteTag, CompoundTag, ListTag, StringTag } from "@serenityjs/nbt";

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
    this.component.add(new StringTag(type.identifier, "block"));
  }

  /**
   * Get the whether the block image should be used as the item icon.
   * @returns Whether the block image is the item icon.
   */
  public getUseBlockAsIcon(): boolean {
    return this.component.get<ByteTag>("canUseBlockAsIcon")?.valueOf() === 1;
  }

  /**
   * Set the whether the block image should be used as the item icon.
   * @param value Whether the block image is the item icon.
   */
  public setUseBlockAsIcon(value: boolean): void {
    // Add a new byte tag to the component indicating if the block image is used as the icon.
    this.component.add(new ByteTag(value ? 1 : 0, "canUseBlockAsIcon"));
  }

  /**
   * Get the blocks that this item can be used on.
   * @returns The blocks that this item can be used on.
   */
  public getUseOnBlocks(): Array<BlockIdentifier | string> {
    // Get the use on tag.
    const useOn = this.component.get<ListTag<CompoundTag>>("use_on")!;

    // Return the block identifiers.
    return useOn.map((tag) => {
      return tag.get<StringTag>("name")?.valueOf() as BlockIdentifier;
    });
  }

  /**
   * Set the blocks that this item can be used on.
   * @param value The blocks that this item can be used on.
   */
  public setUseOnBlocks(value: Array<BlockIdentifier | string>): void {
    // Create a new list tag for use on blocks.
    const useOn = new ListTag<CompoundTag>([], "use_on");

    // Iterate over the blocks and create a tag for each.
    for (const block of value) {
      // Create the block tag and set the name.
      const tag = new CompoundTag();
      tag.add(new StringTag(block, "name"));

      // Add the block to the use on list.
      useOn.push(tag);
    }

    // Add the use on list to the component.
    this.component.add(useOn);
  }
}

export { ItemTypeBlockPlacerComponent, ItemTypeBlockPlacerComponentOptions };
