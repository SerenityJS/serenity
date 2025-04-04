import { EntityEnum, EntityTraitEnum } from "../commands";

import { CustomEntityType, EntityType } from "./identity";

import { EntityTraits } from ".";

import type { EntityTrait, PlayerTrait } from "./traits";

class EntityPalette {
  /**
   * The types of entities registered in the palette.
   */
  public readonly types = EntityType.types;

  /**
   * The traits registered in the palette.
   */
  public readonly traits = new Map<
    string,
    typeof EntityTrait | typeof PlayerTrait
  >();

  /**
   * Creates a new entity palette.
   */
  public constructor() {
    // Register all entity traits.
    this.registerTrait(...EntityTraits);
  }

  /**
   * Gets all entity types from the palette.
   * @returns All entity types from the palette.
   */
  public getAllTypes(): Array<EntityType> {
    return [...this.types.values()];
  }

  public getAllCustomTypes(): Array<CustomEntityType> {
    return this.getAllTypes().filter(
      (type) => type instanceof CustomEntityType
    );
  }

  /**
   * Gets an entity type from the palette.
   * @param identifier The entity identifier to get.
   * @returns The entity type from the palette.
   */
  public getType(identifier: string): EntityType | null {
    return this.types.get(identifier) as EntityType;
  }

  /**
   * Gets an entity type from the palette by its unique identifier.
   * @param unique The unique identifier of the entity type.
   * @returns The entity type from the palette.
   */
  public getTypeByUnique(unique: bigint): EntityType | null {
    // Convert the unique identifier to a network identifier.
    const network = Number(unique >> 19n);

    // Iterate over the entity types.
    for (const type of this.types.values()) {
      // Check if the network identifier matches.
      if (type.network === network) return type;
    }

    // Return null if the entity type was not found.
    return null;
  }

  /**
   * Register an entity type to the palette.
   * @param type The entity type to register.
   */
  public registerType(...types: Array<EntityType>): this {
    // Iterate over the provided types.
    for (const type of types) {
      // Check if the entity type is already registered.
      if (this.types.has(type.identifier)) continue;

      // Register the entity type.
      this.types.set(type.identifier, type);

      // Add the entity type to the entity enum.
      EntityEnum.options.push(type.identifier);

      // Iterate over the entity traits of the palette.
      for (const [, trait] of this.traits) {
        // Check if the entity type has the trait.
        if (trait.types.includes(type.identifier)) {
          // Register the trait to the entity type.
          type.registerTrait(trait);
        }

        // Check if the trait has components, and the entity type has the components.
        else if (trait.components.length > 0) {
          // Iterate over the components of the trait.
          for (const component of trait.components) {
            // Check if the entity type has the component.
            if (type.components.includes(component)) {
              // Register the trait to the entity type.
              type.registerTrait(trait);
            }
          }
        }
      }
    }

    // Return this instance.
    return this;
  }

  /**
   * Register a trait to the palette.
   * @param trait The trait to register.
   * @returns True if the trait was registered, false otherwise.
   */
  public registerTrait(
    ...traits: Array<typeof EntityTrait | typeof PlayerTrait>
  ): this {
    // Iterate over the provided traits.
    for (const trait of traits) {
      // Check if the entity trait is already registered.
      if (this.traits.has(trait.identifier)) continue;

      // Register the entity trait.
      this.traits.set(trait.identifier, trait);

      // Iterate over the entity types.
      for (const [, type] of this.types) {
        // Check if the trait contains the type.
        if (trait.types.includes(type.identifier)) {
          // Register the trait to the entity type.
          type.registerTrait(trait);
        }

        // Check if the trait has components, and the entity type has the components.
        else if (trait.components.length > 0) {
          // Iterate over the components of the trait.
          for (const component of trait.components) {
            // Check if the entity type has the component.
            if (type.components.includes(component)) {
              // Register the trait to the entity type.
              type.registerTrait(trait);
            }
          }
        }
      }

      // Check if the trait has an identifier.
      if (trait.identifier !== undefined) {
        // Check if the trait is already in the entity trait enum.
        if (!EntityTraitEnum.options.includes(trait.identifier)) {
          // If not, add the trait to the entity trait enum.
          EntityTraitEnum.options.push(trait.identifier);
        }
      }
    }

    // Return this instance.
    return this;
  }

  /**
   * Remove a entity trait from the palette.
   * @param type The entity type to remove the trait from, or the identifier of the trait.
   */
  public removeTrait(...types: Array<string | typeof EntityTrait>): this {
    // Iterate over the provided types.
    for (const type of types) {
      // Get the identifier of the passed type.
      const identifier = typeof type === "string" ? type : type.identifier;

      // Check if the trait exists.
      if (!this.traits.has(identifier)) continue;

      // Get the trait.
      const trait = this.traits.get(identifier);

      // Check if the trait exists.
      if (!trait) continue;

      // Iterate over the entity types.
      for (const [, type] of this.types) {
        // Check if the entity type has the trait.
        if (type.traits.has(identifier)) {
          // Unregister the trait from the entity type.
          type.unregisterTrait(identifier);
        }
      }

      // Remove the trait from the palette.
      this.traits.delete(identifier);
    }

    // Return this instance.
    return this;
  }

  /**
   * Get all traits from the palette.
   * @returns
   */
  public getAllTraits(): Array<typeof EntityTrait | typeof PlayerTrait> {
    return [...this.traits.values()];
  }

  /**
   * Get a trait from the palette.
   * @param identifier The identifier of the trait.
   * @returns The trait from the palette.
   */
  public getTrait(
    identifier: string
  ): typeof EntityTrait | typeof PlayerTrait | null {
    return this.traits.get(identifier) || null;
  }
}

export { EntityPalette };
