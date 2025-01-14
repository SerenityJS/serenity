import { CompoundTag } from "@serenityjs/nbt";

import { BlockPermutation } from "./permutation";
import { BlockType } from "./type";
import {
  BlockFrictionProperty,
  BlockHardnessProperty,
  type BlockProperty
} from "./properties";

class BlockPropertyCollection extends CompoundTag<unknown> {
  /**
   * The type of block that the properties are for.
   */
  protected readonly block: BlockType;

  /**
   * The properties of the block.
   */
  public readonly properties = new Map<string, BlockProperty>();

  /**
   * Create a new block property collection.
   * @param block
   */
  public constructor(block: BlockType | BlockPermutation) {
    // The name of the compound tag.
    super({ name: "components" });

    // Set the block type that the properties are for.
    this.block = block instanceof BlockPermutation ? block.type : block;
  }

  /**
   * Gets a property from the block.
   * @param property The property to get.
   * @returns The property instance.
   */
  public get<T extends typeof BlockProperty>(
    property: T
  ): InstanceType<T> | undefined {
    return this.properties.get(property.component) as InstanceType<T>;
  }

  /**
   * Checks if the block has a property.
   * @param property The property to check.
   * @returns True if the block has the property, false otherwise.
   */
  public has<T extends typeof BlockProperty>(property: T): boolean {
    return this.properties.has(property.component);
  }

  /**
   * Adds a new property to the block.
   * @param property The property to add.
   * @returns The property instance.
   */
  public add<
    T extends typeof BlockProperty,
    A extends ConstructorParameters<T>[1]
  >(property: T, ...args: [A]): InstanceType<T> {
    // Create a new instance of the property.
    const instance = new property(this.block, ...args);

    // Add the property to the block.
    this.properties.set(property.component, instance);

    // Return the property instance.
    return instance as InstanceType<T>;
  }

  /**
   * Removes a property from the block.
   * @param property The property to remove.
   */
  public remove<T extends typeof BlockProperty>(property: T): void {
    this.properties.delete(property.component);
  }

  public get hardness(): number {
    return this.get(BlockHardnessProperty)?.hardness ?? 0;
  }

  public set hardness(value: number) {
    this.add(BlockHardnessProperty, value);
  }

  public get friction(): number {
    return this.get(BlockFrictionProperty)?.friction ?? 0;
  }

  public set friction(value: number) {
    this.add(BlockFrictionProperty, value);
  }
}

export { BlockPropertyCollection };
