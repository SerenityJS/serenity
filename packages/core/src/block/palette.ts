import { BlockIdentifier } from "../enums";
import { BlockEnum } from "..";

import { BlockPermutation, BlockType, CustomBlockType } from "./identity";

import { BlockState, BlockTraits } from ".";

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

  public constructor() {
    // Register all block traits.
    this.registerTrait(...BlockTraits);
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
  public resolvePermutation(
    identifier: BlockIdentifier | string | number,
    state?: BlockState
  ): BlockPermutation {
    // Get the block type from the registry.
    const type =
      typeof identifier === "number"
        ? this.permutations.get(identifier)?.type
        : this.types.get(identifier);

    // Check if the block type exists.
    if (!type)
      return this.resolvePermutation(BlockIdentifier.Air) as BlockPermutation;

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
      return type.permutations[0] as BlockPermutation;
    }

    // Return the block permutation.
    return permutation as BlockPermutation;
  }

  /**
   * Register a block type to the palette.
   * @param type The block type to register.
   * @returns Whether the block type was registered.
   */
  public registerType(...types: Array<BlockType>): this {
    // Iterate over the block types.
    for (const type of types) {
      // Check if the block type already exists.
      if (this.types.has(type.identifier)) continue;

      // Register the block type.
      this.types.set(type.identifier, type);

      // Add the block type to the block enum.
      BlockEnum.options.push(type.identifier);

      // Register the permutations of the block type.
      for (const permutation of type.permutations)
        this.registerPermutation(permutation);

      // Iterate over the traits of palette.
      for (const [, trait] of this.traits) {
        // Check if the type contains the trait.
        if (trait.types.includes(type.identifier)) {
          // Register the trait to the block type.
          type.registerTrait(trait);
        }

        // Check if the type contains the state.
        else if (trait.state && type.states.includes(trait.state)) {
          // Register the trait to the block type.
          type.registerTrait(trait);
        }

        // Check if the type contains the tag.
        else if (trait.tag && type.hasTag(trait.tag)) {
          // Register the trait to the block type.
          type.registerTrait(trait);
        }

        // Check if the type contains the components.
        else if (trait.component) {
          // Check if the block type has the component.
          if (type.components.hasComponent(trait.component)) {
            // Register the trait to the block type.
            type.registerTrait(trait);
          }
        }
      }
    }

    // Return this instance.
    return this;
  }

  /**
   * Register a block permutation to the palette.
   * @param permutation The block permutation to register.
   * @returns Whether the block permutation was registered.
   */
  public registerPermutation(permutation: BlockPermutation): boolean {
    // Check if the block permutation already exists.
    if (this.permutations.has(permutation.networkId)) return false;

    // Register the block permutation.
    this.permutations.set(permutation.networkId, permutation);

    // Return true if the block permutation was registered.
    return true;
  }

  /**
   * Register a trait to the palette.
   * @param trait The trait to register.
   * @returns True if the trait was registered, false otherwise.
   */
  public registerTrait(...traits: Array<typeof BlockTrait>): this {
    // Iterate over the provided traits.
    for (const trait of traits) {
      // Check if the trait identifier is not defined.
      if (!trait.identifier) continue;

      // Get the identifier of the trait.
      const identifier = trait.state
        ? trait.identifier + "@" + trait.state
        : trait.identifier;

      // Check if the block trait is already registered.
      if (this.traits.has(identifier)) continue;

      // Register the block trait.
      this.traits.set(identifier, trait);

      // Iterate over the block types.
      for (const [, type] of this.types) {
        // Check if the trait has a type, and the block type has the type.
        if (trait.types.includes(type.identifier)) {
          // Register the trait to the block type.
          type.registerTrait(trait);
        }

        // Check if the trait has a state, and the block type has the state.
        else if (trait.state && type.states.includes(trait.state)) {
          // Register the trait to the block type.
          type.registerTrait(trait);
        }

        // Check if the trait has a tag, and the block type has the tag.
        else if (trait.tag && type.hasTag(trait.tag)) {
          // Register the trait to the block type.
          type.registerTrait(trait);
        }

        // Check if the trait has components, and the block type has the components.
        else if (trait.component) {
          // Check if the block type has the component.
          if (type.components.hasComponent(trait.component)) {
            // Register the trait to the block type.
            type.registerTrait(trait);
          }
        }
      }
    }

    // Return this instance.
    return this;
  }

  /**
   * Removes a block trait from the palette.
   * @param type The block trait type to remove, or the identifier of the trait.
   */
  public unregisterTrait(...types: Array<string | typeof BlockTrait>): this {
    // Iterate over the provided types.
    for (const type of types) {
      // Get the identifier of the passed type.
      let identifier = typeof type === "string" ? type : type.identifier;

      // Check if the block trait has a state.
      if (typeof type !== "string" && type.state)
        identifier += "@" + type.state;

      // Check if the trait exists.
      if (!this.traits.has(identifier)) continue;

      // Get the trait.
      const trait = this.traits.get(identifier);

      // Check if the trait exists.
      if (!trait) continue;

      // Iterate over the block types.
      for (const [, type] of this.types) {
        // Check if the block type has the trait.
        if (type.traits.has(trait.identifier)) {
          // Unregister the trait from the block type.
          type.unregisterTrait(trait);
        }
      }

      // Remove the trait from the palette.
      this.traits.delete(identifier);
    }

    // Return this instance.
    return this;
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
   * @param state The state of the trait.
   * @returns The trait from the palette.
   */
  public getTrait(
    identifier: string,
    state?: string | null
  ): typeof BlockTrait | null {
    // Get the trait identifier.
    const traitIdentifier = state ? identifier + "@" + state : identifier;

    // Get the trait from the palette.
    return this.traits.get(traitIdentifier) ?? null;
  }
}

export { BlockPalette };
