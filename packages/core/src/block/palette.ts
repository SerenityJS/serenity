import { BlockIdentifier } from "../enums";
import { BlockState } from "../types";
import { BlockEnum } from "..";

import { BlockPermutation, BlockType, CustomBlockType } from "./identity";

import { BlockTraits } from ".";

import type { BlockTrait } from "./traits";

class BlockPalette {
  /**
   * The registered block types for the palette.
   */
  public readonly types = BlockType.types;

  /**
   * The registered block permutations for the palette.
   */
  public readonly permutations = BlockPermutation.permutations;

  /**
   * The registered block traits for the palette.
   */
  public readonly traits = new Map<string, typeof BlockTrait>();

  /**
   * The registry for the block traits.
   */
  public readonly registry = new Map<
    BlockIdentifier,
    Array<typeof BlockTrait>
  >();

  public constructor() {
    // Register all block traits.
    for (const trait of BlockTraits) this.registerTrait(trait);
  }

  /**
   * Gets all block types from the palette.
   * @returns All block types from the palette.
   */
  public getAllTypes(): Array<BlockType> {
    return [...this.types.values()];
  }

  /**
   * Gets all custom block types from the palette.
   * @returns All custom block types from the palette.
   */
  public getAllCustomTypes(): Array<CustomBlockType> {
    return this.getAllTypes().filter((type) => type instanceof CustomBlockType);
  }

  /**
   * Gets all block permutations from the palette.
   * @returns All block permutations from the palette.
   */
  public getAllPermutations(): Array<BlockPermutation> {
    return [...this.permutations.values()];
  }

  /**
   * Gets a block type from the palette.
   * @param identifier The block identifier to get.
   * @returns The block type from the palette.
   */
  public resolveType(identifier: BlockIdentifier): BlockType {
    return this.types.get(identifier) as BlockType;
  }

  /**
   * Resolves a block permutation from the block identifier and state.
   * @param identifier The block identifier to resolve.
   * @param state The block state to resolve.
   * @returns The block permutation from the palette.
   */
  public resolvePermutation<T extends keyof BlockState>(
    identifier: T,
    state?: BlockState[T]
  ): BlockPermutation<T> {
    // Get the block type from the registry.
    const type = this.resolveType(identifier as BlockIdentifier);

    // Check if the block type exists.
    if (!type)
      return this.resolvePermutation(
        BlockIdentifier.Air
      ) as BlockPermutation<T>;

    // Check if the state is not provided.
    const permutation = type.permutations.find((permutation) => {
      for (const key in state) {
        // Get the value of the block state.
        const value = (permutation.state as never)[key];

        // Check if the value is a boolean
        const bool = value === true || value === false ? true : false;

        // Convert the state to a boolean if it is a boolean.
        const query =
          bool && (state[key] === 0 || state[key] === 1)
            ? state[key] === 1
            : state[key];

        // Check if the block state matches
        if (value !== query) {
          return false;
        }
      }

      // Return true if the block permutation matches.
      return true;
    });

    // Check if the block permutation does not exist.
    if (!permutation) {
      // Return the default permutation if the state is not found.
      return type.permutations[0] as BlockPermutation<T>;
    }

    // Return the block permutation.
    return permutation as BlockPermutation<T>;
  }

  /**
   * Register a block type to the palette.
   * @param type The block type to register.
   * @returns Whether the block type was registered.
   */
  public registerType(type: BlockType): boolean {
    // Check if the block type already exists.
    if (this.types.has(type.identifier)) return false;

    // Register the block type.
    this.types.set(type.identifier, type);

    // Add the block type to the block enum.
    BlockEnum.options.push(type.identifier);

    // Register the permutations of the block type.
    for (const permutation of type.permutations) {
      this.registerPermutation(permutation);
    }

    // Return true if the block type was registered.
    return true;
  }

  /**
   * Register a block permutation to the palette.
   * @param permutation The block permutation to register.
   * @returns Whether the block permutation was registered.
   */
  public registerPermutation(permutation: BlockPermutation): boolean {
    // Check if the block permutation already exists.
    if (this.permutations.has(permutation.network)) return false;

    // Register the block permutation.
    this.permutations.set(permutation.network, permutation);

    // Return true if the block permutation was registered.
    return true;
  }

  /**
   * Get the registry for the block identifier.
   * @param type The block identifier to get the registry for.
   * @returns The registry for the block identifier.
   */
  public getRegistry(type: BlockIdentifier): Array<typeof BlockTrait> {
    // Get the registry for the block identifier.
    const registry = this.registry.get(type) || [];

    // Return the registry.
    return registry as Array<typeof BlockTrait>;
  }

  /**
   * Register a trait to the palette.
   * @param trait The trait to register.
   * @returns True if the trait was registered, false otherwise.
   */
  public registerTrait(trait: typeof BlockTrait): boolean {
    // Get the identifier of the trait.
    const identifier = trait.state
      ? trait.identifier + ":" + trait.state
      : trait.identifier;

    // Check if the block trait is already registered.
    if (this.traits.has(identifier)) return false;

    // Register the block trait.
    this.traits.set(identifier, trait);

    // Iterate over the types of the trait.
    for (const type of trait.types) {
      // Check if the registry has the block identifier.
      if (!this.registry.has(type))
        // Set the registry for the block identifier.
        this.registry.set(type, []);

      // Get the registry for the block identifier.
      const registry = this.registry.get(type);

      // Check if the registry exists.
      if (registry) {
        // Push the trait to the registry.
        registry.push(trait);

        // Set the registry for the block identifier.
        this.registry.set(type, registry);
      }
    }

    // Return true if the block trait was registered.
    return true;
  }

  /**
   * Remove a trait from the palette.
   * @param identifier The identifier of the trait.
   * @returns True if the trait was removed, false otherwise.
   */
  public removeTrait(identifier: string): boolean {
    // Check if the trait exists.
    if (!this.traits.has(identifier)) return false;

    // Get the trait.
    const trait = this.traits.get(identifier);

    // Check if the trait exists.
    if (!trait) return false;

    // Iterate over the types of the trait.
    for (const type of trait.types) {
      // Get the registry for the block identifier.
      const registry = this.registry.get(type);

      // Check if the registry exists.
      if (registry) {
        // Remove the trait from the registry.
        this.registry.set(
          type,
          registry.filter((trait) => trait.identifier !== identifier)
        );
      }
    }

    // Remove the trait from the palette.
    this.traits.delete(identifier);

    // Return true if the trait was removed.
    return true;
  }

  /**
   * Get all the traits from the palette.
   * @returns All the traits from the palette.
   */
  public getAllTraits(): Array<typeof BlockTrait> {
    return [...this.traits.values()];
  }

  /**
   * Get a trait from the palette.
   * @param identifier The identifier of the trait.
   * @returns The trait from the palette.
   */
  public getTrait(identifier: string): typeof BlockTrait | null {
    return this.traits.get(identifier) ?? null;
  }
}

export { BlockPalette };
