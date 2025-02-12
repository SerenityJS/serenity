import { CompoundTag } from "@serenityjs/nbt";

import { BlockPermutation } from "./permutation";
import { BlockType } from "./type";
import {
  BlockTypeFrictionComponent,
  BlockTypeHardnessComponent,
  type BlockTypeComponent
} from "./components";

class BlockTypeComponentCollection extends CompoundTag<unknown> {
  /**
   * The type of block that the properties are for.
   */
  protected readonly block: BlockType | BlockPermutation;

  /**
   * The component definitions of the block type.
   */
  public readonly entries = new Map<string, BlockTypeComponent>();

  /**
   * Create a new block property collection.
   * @param block The block type that the properties are for.
   */
  public constructor(block: BlockType | BlockPermutation) {
    // The name of the compound tag.
    super({ name: "components" });

    // Set the block type that the properties are for.
    this.block = block;
  }

  /**
   * Gets a property from the block.
   * @param property The property to get.
   * @returns The property instance.
   */
  public get<T extends typeof BlockTypeComponent>(
    property: T
  ): InstanceType<T> | undefined {
    return this.entries.get(property.identifier) as InstanceType<T>;
  }

  /**
   * Checks if the block has a property.
   * @param property The property to check.
   * @returns True if the block has the property, false otherwise.
   */
  public has<T extends typeof BlockTypeComponent>(property: T): boolean {
    return this.entries.has(property.identifier);
  }

  /**
   * Adds a new property to the block.
   * @param property The property to add.
   * @returns The property instance.
   */
  public add<
    T extends typeof BlockTypeComponent,
    A extends ConstructorParameters<T>[1]
  >(property: T, ...args: [A]): InstanceType<T> {
    // Check if the component already exists.
    if (this.entries.has(property.identifier))
      return this.entries.get(property.identifier) as InstanceType<T>;

    // Create the new component.
    const component = new property(this.block, ...args);

    // Add the component to the collection.
    this.entries.set(property.identifier, component);

    // Return the component.
    return component as InstanceType<T>;
  }

  /**
   * Removes a property from the block.
   * @param property The property to remove.
   */
  public remove<T extends typeof BlockTypeComponent>(property: T): void {
    // Check if the component exists.
    if (!this.entries.has(property.identifier)) return;

    // Remove the component from the collection.
    this.entries.delete(property.identifier);

    // Remove the component from the compound tag.
    this.removeTag(property.identifier);
  }

  public get hardness(): number {
    return this.get(BlockTypeHardnessComponent)?.hardness ?? 0;
  }

  public set hardness(value: number) {
    this.add(BlockTypeHardnessComponent, value);
  }

  public get friction(): number {
    return this.get(BlockTypeFrictionComponent)?.friction ?? 0;
  }

  public set friction(value: number) {
    this.add(BlockTypeFrictionComponent, value);
  }
}

export { BlockTypeComponentCollection };
