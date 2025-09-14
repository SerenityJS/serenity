import {
  ContainerId,
  ContainerOpenPacket,
  ContainerType,
  IPosition
} from "@serenityjs/protocol";
import { ByteTag, IntTag, StringTag } from "@serenityjs/nbt";

import { BlockInteractionOptions } from "../..";
import { BlockIdentifier } from "../../enums";

import { BlockTrait } from "./trait";

class BlockStructureTrait extends BlockTrait {
  public static readonly identifier = "structure_block";
  public static readonly types = [BlockIdentifier.StructureBlock];

  public onInteract(options: BlockInteractionOptions): void {
    if (!options.origin || options.cancel) return;

    const packet = new ContainerOpenPacket();
    packet.type = ContainerType.StructureEditor;
    packet.identifier = ContainerId.None;
    packet.position = this.block.position;
    packet.uniqueId = -1n;

    options.origin.send(packet);
  }

  /**
   * Get the structure mode from the structure block.
   * @returns The mode of the structure block.
   */
  public getMode(): number {
    // Get the mode from the block's NBT data
    return this.block.getStorageEntry<IntTag>("data")?.valueOf() || 0;
  }

  /**
   * Sets the mode of the structure block.
   * @param mode The mode to set for the structure block.
   */
  public setMode(mode: number): void {
    // Set the mode in the block's NBT data
    this.block.setStorageEntry("data", new IntTag(mode));
  }

  /**
   * Get the structure name from the block's NBT data.
   * @returns The structure name or an empty string if not set.
   */
  public getStructureName(): string {
    // Get the structure name from the block's NBT data
    const tag = this.block.getStorageEntry<StringTag>("structureName");

    // Return the structure name or an empty string if not set
    return tag?.valueOf() || "";
  }

  /**
   * Sets the structure name in the block's NBT data.
   * @param name The name of the structure to set.
   */
  public setStructureName(name: string): void {
    // Set the structure name in the block's NBT data
    this.block.setStorageEntry("structureName", new StringTag(name));
  }

  /**
   * Gets the structure size from the block's NBT data.
   * @returns The structure size as an IPosition.
   */
  public getSize(): IPosition {
    // Get the structure size from the block's NBT data
    const x =
      this.block.getStorageEntry<IntTag>("xStructureSize")?.valueOf() || 0;
    const y =
      this.block.getStorageEntry<IntTag>("yStructureSize")?.valueOf() || 0;
    const z =
      this.block.getStorageEntry<IntTag>("zStructureSize")?.valueOf() || 0;

    // Return the size as an IPosition
    return { x, y, z };
  }

  /**
   * Sets the structure size in the block's NBT data.
   * @param size The size of the structure to set.
   */
  public setSize(size: IPosition): void {
    // Set the structure size in the block's NBT data
    this.block.setStorageEntry("xStructureSize", new IntTag(size.x));
    this.block.setStorageEntry("yStructureSize", new IntTag(size.y));
    this.block.setStorageEntry("zStructureSize", new IntTag(size.z));
  }

  /**
   * Gets the structure offset from the block's NBT data.
   * @returns The structure offset as an IPosition.
   */
  public getOffset(): IPosition {
    // Get the structure offset from the block's NBT data
    const x =
      this.block.getStorageEntry<IntTag>("xStructureOffset")?.valueOf() || 0;
    const y =
      this.block.getStorageEntry<IntTag>("yStructureOffset")?.valueOf() || 0;
    const z =
      this.block.getStorageEntry<IntTag>("zStructureOffset")?.valueOf() || 0;

    // Return the offset as an IPosition
    return { x, y, z };
  }

  /**
   * Sets the structure offset in the block's NBT data.
   * @param offset The offset of the structure to set.
   */
  public setOffset(offset: IPosition): void {
    // Set the structure offset in the block's NBT data
    this.block.setStorageEntry("xStructureOffset", new IntTag(offset.x));
    this.block.setStorageEntry("yStructureOffset", new IntTag(offset.y));
    this.block.setStorageEntry("zStructureOffset", new IntTag(offset.z));
  }

  /**
   * Whether the bounding box of the structure is visible.
   * @returns True if the bounding box is visible, false otherwise.
   */
  public getBoundingBoxVisible(): boolean {
    return (
      this.block.getStorageEntry<ByteTag>("showBoundingBox")?.valueOf() === 1
    );
  }

  /**
   * Sets whether the bounding box of the structure is visible.
   * @param visible True to make the bounding box visible, false to hide it.
   */
  public setBoundingBoxVisible(visible: boolean): void {
    this.block.setStorageEntry("showBoundingBox", new ByteTag(visible ? 1 : 0));
  }
}

export { BlockStructureTrait };
