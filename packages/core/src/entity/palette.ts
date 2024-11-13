import { EntityIdentifier } from "../enums";
import { EntityEnum } from "../commands";

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
   * The registry for the entity traits.
   */
  public readonly registry = new Map<
    EntityIdentifier,
    Array<typeof EntityTrait | typeof PlayerTrait>
  >();

  /**
   * Creates a new entity palette.
   */
  public constructor() {
    // Register all entity traits.
    for (const trait of EntityTraits) this.registerTrait(trait);
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
   * @returns True if the entity type was registered, false otherwise.
   */
  public registerType(type: EntityType): boolean {
    // Check if the entity type is already registered.
    if (this.types.has(type.identifier)) return false;

    // Register the entity type.
    this.types.set(type.identifier, type);

    // Add the entity type to the entity enum.
    EntityEnum.options.push(type.identifier);

    // Return true if the entity type was registered.
    return true;
  }

  /**
   * Get the registry for the given entity identifier.
   * @param identifier The entity identifier to get the registry for.
   * @returns The registry for the given entity identifier.
   */
  public getRegistryFor(
    identifier: EntityIdentifier
  ): Array<typeof EntityTrait> {
    // Get the registry for the given entity identifier.
    const registry = this.registry.get(identifier) || [];

    // Return the registry.
    return registry as Array<typeof EntityTrait>;
  }

  /**
   * Register a trait to the palette.
   * @param trait The trait to register.
   * @returns True if the trait was registered, false otherwise.
   */
  public registerTrait(
    trait: typeof EntityTrait | typeof PlayerTrait
  ): boolean {
    // Check if the entity trait is already registered.
    if (this.traits.has(trait.identifier)) return false;

    // Register the entity trait.
    this.traits.set(trait.identifier, trait);

    // Iterate over the types of the trait.
    for (const type of trait.types ?? []) {
      // Check if the registry has the entity identifier.
      if (!this.registry.has(type as EntityIdentifier))
        // Set the registry for the entity identifier.
        this.registry.set(type as EntityIdentifier, []);

      // Get the registry for the entity identifier.
      const registry = this.registry.get(type as EntityIdentifier);

      // Check if the registry exists.
      if (registry) {
        // Push the trait to the registry.
        registry.push(trait);

        // Set the registry for the entity identifier.
        this.registry.set(type as EntityIdentifier, registry);
      }
    }

    // Return true if the entity trait was registered.
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
    for (const type of trait.types ?? []) {
      // Get the registry for the entity identifier.
      const registry = this.registry.get(type as EntityIdentifier);

      // Check if the registry exists.
      if (registry) {
        // Remove the trait from the registry.
        this.registry.set(
          type as EntityIdentifier,
          registry.filter((c) => c !== trait)
        );
      }
    }

    // Remove the trait from the palette.
    this.traits.delete(identifier);

    // Return true if the trait was removed.
    return true;
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
