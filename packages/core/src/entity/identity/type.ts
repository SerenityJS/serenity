import { CompoundTag } from "@serenityjs/nbt";

import type { EntityIdentifier } from "../../enums";

type ComponentRecord<T> = T & { identifier: string };

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
   * Register a component to the entity type.
   * @param component The component to register.
   */
  public register<T>(component: ComponentRecord<T>): void {
    // Check if the component is already registered
    if (this.components.includes(component.identifier)) {
      throw new Error(
        `Component ${component.identifier} is already registered to entity type ${this.identifier}`
      );
    } else {
      this.components.push(component.identifier);
    }
  }

  /**
   * Unregister a component from the entity type.
   * @param component The component to unregister.
   */
  public unregister<T>(component: ComponentRecord<T>): void {
    // Check if the component is registered
    if (this.components.includes(component.identifier)) {
      this.components.splice(this.components.indexOf(component.identifier), 1);
    } else {
      throw new Error(
        `Component ${component.identifier} is not registered to entity type ${this.identifier}`
      );
    }
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
