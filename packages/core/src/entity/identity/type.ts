import { CompoundTag } from "@serenityjs/nbt";

import type { EntityTrait } from "../traits";
import type { EntityIdentifier } from "../../enums";

class EntityType {
  /**
   * A collective registry of all entity types.
   */
  public static readonly types = new Map<string, EntityType>();

  /**
   * The network identifier counter for entity types.
   */
  public static network = 0;

  /**
   * The identifier of the entity type.
   */
  public readonly identifier: EntityIdentifier;

  /**
   * The network id of the entity type.
   */
  public readonly network: number = ++EntityType.network;

  /**
   * The traits that are bound to the entity type.
   * These traits are used to define custom behavior for the entity type.
   */
  public readonly traits = new Map<string, typeof EntityTrait>();

  /**
   * The default components of the entity type.
   */
  public readonly components: Array<string>;

  /**
   * Create a new entity type.
   * @param identifier The identifier of the entity type.
   * @param components The default components of the entity type.
   */
  public constructor(identifier: EntityIdentifier, components?: Array<string>) {
    this.identifier = identifier;
    this.components = components ?? [];
  }

  /**
   * Register a trait to the entity type.
   * @param trait The trait to register.
   * @returns The entity type instance.
   */
  public registerTrait(trait: typeof EntityTrait): this {
    // Check if the trait is already registered.
    if (this.traits.has(trait.identifier)) return this;

    // Add the trait to the entity type.
    this.traits.set(trait.identifier, trait);

    // Return this instance.
    return this;
  }

  /**
   * Unregister a trait from the entity type.
   * @param trait The trait to unregister, or the identifier of the trait.
   * @returns The entity type instance.
   */
  public unregisterTrait(trait: string | typeof EntityTrait): this {
    // Get the identifier of the trait.
    const identifier = typeof trait === "string" ? trait : trait.identifier;

    // Check if the trait is not registered.
    if (!this.traits.has(identifier)) return this;

    // Remove the trait from the entity type.
    this.traits.delete(identifier);

    // Return this instance.
    return this;
  }

  /**
   * Get the entity type from the registry.
   * @param identifier The identifier of the entity type.
   * @returns The entity type, if found; otherwise, null.
   */
  public static get(identifier: EntityIdentifier): EntityType | null {
    return EntityType.types.get(identifier) as EntityType;
  }

  /**
   * Get all entity types from the registry.
   * @returns An array of all entity types.
   */
  public static getAll(): Array<EntityType> {
    return [...EntityType.types.values()];
  }

  public static toNbt(type: EntityType): CompoundTag<unknown> {
    // Create a root compound tag for the entity type.
    const root = new CompoundTag();

    // Create a compound tag for the entity data.
    root.createStringTag({ name: "bid", value: "" });
    root.createByteTag({ name: "hasspawnegg", value: 1 });
    root.createStringTag({ name: "id", value: type.identifier });
    root.createIntTag({ name: "rid", value: type.network });
    root.createByteTag({ name: "summonable", value: 1 });

    // Return the root compound tag.
    return root;
  }
}

export { EntityType };
