import { CompoundTag } from "@serenityjs/nbt";

import { CustomBlockType } from "../..";
import { BlockIdentifier } from "../../enums";
import {
  BlockState,
  BlockTypeProperties,
  CustomBlockTypeVanillaNbt
} from "../../types";

import { ItemDrop } from "./drops";

import type { BlockPermutation } from "./permutation";

const DefaultBlockTypeProperties: BlockTypeProperties = {
  loggable: false,
  air: false,
  liquid: false,
  solid: false,
  components: [],
  tags: [],
  drops: [],
  permutations: []
};

/**
 * BlockType represents a block type in the game, which hold all possible permutations the block can have.
 * 
 * **Example Usage**
 * ```typescript
	import { BlockType, BlockIdentifier } from "@serenityjs/block"

	// Get the block type for dirt
	const dirtType = BlockType.get(BlockIdentifier.Dirt)

	// Get the identifier of the type
	dirtType.identifier // Expected to be "minecraft:dirt"
 * ```
 */
class BlockType<T extends keyof BlockState = keyof BlockState> {
  /**
   * A collective registry of all block types.
   */
  public static readonly types = new Map<string, BlockType>();

  /**
   * The identifier of the block type.
   */
  public readonly identifier: T;

  /**
   * Whether the block type is custom.
   */
  public readonly custom: boolean;

  /**
   * Whether the block type is loggable.
   */
  public readonly loggable: boolean;

  /**
   * Whether the block type is air.
   */
  public readonly air: boolean;

  /**
   * Whether the block type is liquid.
   */
  public readonly liquid: boolean;

  /**
   * Whether the block type is solid.
   */
  public readonly solid: boolean;

  /**
   * The default components of the block type.
   */
  public readonly components: Array<string> = [];

  /**
   * The default tags of the block type.
   */
  public readonly tags: Array<string> = [];

  /**
   * The default item drops of the block type.
   */
  public readonly drops: Array<ItemDrop> = [];

  /**
   * The default permutations of the block type.
   */
  public readonly permutations: Array<BlockPermutation> = [];

  /**
   * The NBT data of the custom block type.
   */
  public readonly nbt = new CompoundTag<Partial<CustomBlockTypeVanillaNbt>>();

  /**
   * Create a new block type.
   * @param identifier The identifier of the block type.
   * @param properties The properties of the block type.
   */
  public constructor(identifier: T, properties?: Partial<BlockTypeProperties>) {
    this.identifier = identifier;
    this.custom = false;

    // Spread the properties with the default properties.
    const props = { ...DefaultBlockTypeProperties, ...properties };

    // Assign the properties to the block type.
    this.loggable = props.loggable;
    this.air = props.air;
    this.liquid = props.liquid;
    this.solid = props.solid;
    this.components = [...props.components, ...this.components];
    this.tags = [...props.tags, ...this.tags];
    this.drops = [...props.drops, ...this.drops];
    this.permutations = [...props.permutations, ...this.permutations];
  }

  /**
   * Get the permutation of the block type.
   * @param state The state of the block type.
   */
  public getPermutation(state?: BlockState[T]): BlockPermutation<T> {
    // Iterate over the permutations.
    for (const permutation of this.permutations) {
      // Check if the permutation matches the state.
      if (!state || permutation.matches(state as BlockState[T])) {
        return permutation as BlockPermutation<T>;
      }
    }

    // Return the default permutation if the state is not found.
    return this.permutations[0] as BlockPermutation<T>;
  }

  public isCustom(): this is CustomBlockType {
    return this.custom;
  }

  /**
   * Get the block type from the registry.
   */
  public static get<T extends keyof BlockState>(identifier: T): BlockType<T> {
    // Get the block type from the registry.
    const type = BlockType.types.get(identifier as BlockIdentifier);

    // Check if the block type exists.
    if (!type) return this.get(BlockIdentifier.Air) as BlockType<T>;

    // Return the block type.
    return type as BlockType<T>;
  }

  /**
   * Get all block types from the registry.
   */
  public static getAll(): Array<BlockType> {
    return [...BlockType.types.values()];
  }
}

export { BlockType };
