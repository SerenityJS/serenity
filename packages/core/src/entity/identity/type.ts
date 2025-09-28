import {
  ByteTag,
  CompoundTag,
  IntTag,
  ListTag,
  StringTag
} from "@serenityjs/nbt";

import {
  EntityBooleanProperty,
  EntityEnumProperty,
  EntityFloatProperty,
  EntityIntProperty,
  type EntityProperty
} from "./properties";

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
   * The properties that are bound to the entity type.
   */
  private readonly properties = new Map<string, EntityProperty>();

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
   * Get all properties of the entity type.
   * @returns An array of all properties of the entity type.
   */
  public getAllProperties(): Array<[string, EntityProperty]> {
    return Array.from(this.properties.entries());
  }

  /**
   * Check if the entity type has a property with the given identifier.
   * @param identifier The identifier of the property.
   * @returns True if the property exists, false otherwise.
   */
  public hasProperty(identifier: string): boolean {
    return this.properties.has(identifier);
  }

  /**
   * Create a new integer property for the entity type.
   * @param identifier The identifier of the property.
   * @param range The value range of the property. (min to max)
   * @param defaultValue The default value of the property, if not specified, minimum value will be used.
   * @returns The created integer property.
   */
  public createIntProperty(
    identifier: string,
    range: [number, number],
    defaultValue?: number
  ): EntityIntProperty {
    // Create a new integer property.
    const property = new EntityIntProperty(
      identifier,
      range[0],
      range[1],
      defaultValue
    );

    // Add the property to the entity type.
    this.properties.set(identifier, property);

    // Return the property.
    return property;
  }

  /**
   * Create a new float property for the entity type.
   * @param identifier The identifier of the property.
   * @param range The value range of the property. (min to max)
   * @param defaultValue The default value of the property, if not specified, minimum value will be used.
   * @returns The created float property.
   */
  public createFloatProperty(
    identifier: string,
    range: [number, number],
    defaultValue?: number
  ): EntityFloatProperty {
    // Create a new float property.
    const property = new EntityFloatProperty(
      identifier,
      range[0],
      range[1],
      defaultValue
    );

    // Add the property to the entity type.
    this.properties.set(identifier, property);

    // Return the property.
    return property;
  }

  /**
   * Create a new boolean property for the entity type.
   * @param identifier The identifier of the property.
   * @param defaultValue The default value of the property, if not specified, false will be used.
   * @returns The created boolean property.
   */
  public createBooleanProperty(
    identifier: string,
    defaultValue?: boolean
  ): EntityBooleanProperty {
    // Create a new boolean property.
    const property = new EntityBooleanProperty(identifier, defaultValue);

    // Add the property to the entity type.
    this.properties.set(identifier, property);

    // Return the property.
    return property;
  }

  /**
   * Create a new enum property for the entity type.
   * @param identifier The identifier of the property.
   * @param values The possible values of the property.
   * @param defaultValue The default value of the property, if not specified, the first value will be used.
   * @returns The created enum property.
   */
  public createEnumProperty(
    identifier: string,
    values: Array<string>,
    defaultValue?: string
  ): EntityEnumProperty {
    // Create a new enum property.
    const property = new EntityEnumProperty(identifier, values, defaultValue);

    // Add the property to the entity type.
    this.properties.set(identifier, property);

    // Return the property.
    return property;
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

  public static toNbt(type: EntityType): CompoundTag {
    // Create a root compound tag for the entity type.
    const root = new CompoundTag();

    // Create a compound tag for the entity data.
    root.add(new StringTag("", "bid"));
    root.add(new ByteTag(1, "hasspawnegg"));
    root.add(new StringTag(type.identifier, "id"));
    root.add(new IntTag(type.network, "rid"));
    root.add(new ByteTag(1, "summonable"));

    // Return the root compound tag.
    return root;
  }

  public static toPropertiesNbt(type: EntityType): CompoundTag {
    // Create a root compound tag for the entity type properties.
    const root = new CompoundTag();

    // Create a compound tag for the entity identifier.
    root.add(new StringTag(type.identifier, "type"));

    // Sort the properties by their identifier.
    const keys = [...type.properties.keys()].sort();
    const values: Array<CompoundTag> = [];

    // Iterate over the sorted keys.
    for (const key of keys) {
      // Create a compound tag for each property.
      const property = type.properties.get(key) as EntityProperty;

      // Push the property compound tag to the values array.
      values.push(property.compound);
    }

    // Create a list tag for the properties.
    const list = new ListTag<CompoundTag>(values, "properties");

    // Add the list tag to the root compound tag.
    root.add(list);

    // Return the root compound tag.
    return root;
  }
}

export { EntityType };
