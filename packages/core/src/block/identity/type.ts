import { CompoundTag } from "@serenityjs/nbt";
import { NetworkBlockTypeDefinition } from "@serenityjs/protocol";
import {
  BLOCK_DROPS,
  BLOCK_METADATA,
  BLOCK_PERMUTATIONS,
  BLOCK_TYPES
} from "@serenityjs/data";

import { BlockIdentifier } from "../../enums";
import {
  BlockState,
  BlockTypeDefinition,
  BlockTypeProperties
} from "../../types";

import { ItemDrop } from "./drops";
import { BlockTypeComponentCollection } from "./collection";
import { BlockPermutation } from "./permutation";

import type { BlockTrait } from "../traits";

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

  // Register all the vanilla block types.
  static {
    // Iterate over the block types.
    for (const type of BLOCK_TYPES) {
      // Check if the block type is already registered.
      if (this.types.has(type.identifier as BlockIdentifier)) {
        throw new Error(`Block type ${type.identifier} is already registered`);
      }

      // Find the block drops for the block type.
      const drop = BLOCK_DROPS.find(
        (drop) => drop.identifier === type.identifier
      );

      // Register the block type.
      const instance = new this(type.identifier as BlockIdentifier, {
        loggable: type.loggable,
        air: type.air,
        liquid: type.liquid,
        solid: type.solid,
        tags: type.tags
      });

      // Check if the block type has drops.
      if (drop) {
        for (const entry of drop?.drops ?? []) {
          // Separate the drop information.
          const { identifier, min, max, chance } = entry;

          // Create a new item drop.
          const itemDrop = new ItemDrop(identifier, min, max, chance);

          // Register the item drop to the block type.
          instance.drops.push(itemDrop);
        }
      }
      // Register the default drop for the block type.
      else instance.drops.push(new ItemDrop(type.identifier, 1, 1, 1));

      // Set the block type in the registry.
      this.types.set(type.identifier as BlockIdentifier, instance);
    }

    // Iterate over the block permutations.
    for (const permutation of BLOCK_PERMUTATIONS) {
      // Get the block type from the registry.
      const type = BlockType.types.get(
        permutation.identifier as BlockIdentifier
      );

      // Check if the block type exists.
      if (!type) {
        throw new Error(`Block type ${permutation.identifier} does not exist`);
      }

      // Find the metadata for the block type.
      const metadata = BLOCK_METADATA.find(
        (meta) => meta.identifier === type.identifier
      ) ?? { hardness: 0, friction: 0, mapColor: "" };

      // Create a new block permutation.
      const instance = BlockPermutation.create(type, permutation.state);

      // Assign the block permutation properties.
      instance.components.setHardness(metadata.hardness);
      instance.components.setFriction(metadata.friction);

      // Register the block permutation in the registry.
      BlockPermutation.permutations.set(instance.networkId, instance);
    }
  }

  /**
   * The identifier of the block type.
   */
  public readonly identifier: T;
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
   * The state values of the block type.
   */
  public readonly states: Array<string> = [];

  /**
   * The nbt properties definition of the block type.
   * This contains the vanilla component definitions.
   */
  public readonly properties: BlockTypeDefinition;

  /**
   * The traitsthat are bound to the block type.
   * These traits are used to define custom behavior for the block type.
   */
  public readonly traits = new Map<string, typeof BlockTrait>();

  /**
   * The vanilla components of the block permutation. (hardness, friction, lighting, etc.)
   * These components are active on the client-end when the query condition is met.
   * These components will be used gobally for all permutations, unless a permutation has a definition that overrides it.
   */
  public get components(): BlockTypeComponentCollection {
    // Check if the block type contains the components tag.
    if (this.properties.hasTag("components")) {
      // Get the components tag from the block type.
      const components =
        this.properties.getTag<CompoundTag<unknown>>("components");

      // Check if the components is instance of the component collection.
      if (components instanceof BlockTypeComponentCollection) return components;

      // Create the new component collection.
      const collection = new BlockTypeComponentCollection(this);

      // Assign the components to the collection.
      collection.value = components.value;

      // Set the components tag to the block type.
      this.properties.setTag("components", collection);

      // Return the component collection.
      return collection;
    }

    // Create the components tag.
    const collection = new BlockTypeComponentCollection(this);

    // Add the components tag to the block type.
    this.properties.addTag(collection);

    // Return the components tag.
    return collection;
  }

  /**
   * Whether the block type is component based.
   * This is determined by the presence of any components in the block type.
   */
  public get isComponentBased(): boolean {
    return this.components.getTags().length > 0;
  }

  /**
   * Create a new block type.
   * @param identifier The identifier of the block type.
   * @param properties The properties of the block type.
   */
  public constructor(identifier: T, properties?: Partial<BlockTypeProperties>) {
    // Assign the identifier of the block type.
    this.identifier = identifier;

    // Assign the properties to the block type.
    this.loggable = properties?.loggable ?? false;
    this.air = properties?.air ?? false;
    this.liquid = properties?.liquid ?? false;
    this.solid = properties?.solid ?? false;
    this.tags = properties?.tags ?? [];
    this.properties = properties?.properties ?? new CompoundTag();
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

  /**
   * Gets the network definition of the block type, which is used to send the block type to the client.
   * @returns The network block type definition.
   */
  public getNetworkDefinition(): NetworkBlockTypeDefinition {
    return new NetworkBlockTypeDefinition(this.identifier, this.properties);
  }

  /**
   * Register a trait to the block type.
   * @param trait The trait to register.
   * @returns The block type instance.
   */
  public registerTrait(trait: typeof BlockTrait): this {
    // Check if the trait is already registered.
    if (this.traits.has(trait.identifier)) return this;

    // Add the trait to the block type.
    this.traits.set(trait.identifier, trait);

    // Return this instance.
    return this;
  }

  /**
   * Unregister a trait from the block type.
   * @param trait The trait to unregister.
   * @returns The block type instance.
   */
  public unregisterTrait(trait: string | typeof BlockTrait): this {
    // Get the identifier of the trait.
    const identifier = typeof trait === "string" ? trait : trait.identifier;

    // Check if the trait is not registered.
    if (!this.traits.has(identifier)) return this;

    // Remove the trait from the block type.
    this.traits.delete(identifier);

    // Return this instance.
    return this;
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
