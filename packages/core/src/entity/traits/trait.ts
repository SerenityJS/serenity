import { Trait } from "../../trait";
import { EntityIdentifier } from "../../enums";
import { Entity } from "../entity";
import { Player } from "../player";

class EntityTrait extends Trait {
  /**
   * The entity type identifiers that this trait is compatible with by default.
   */
  public static readonly type: Array<EntityIdentifier> = [];

  /**
   * The entity that this trait is attached to.
   */
  protected readonly entity: Entity;

  /**
   * Creates a new instance of the entity trait.
   * @param entity The entity that this trait will be attached to.
   */
  public constructor(entity: Entity) {
    super();
    this.entity = entity;

    // Register the trait to the entity
    entity.traits.set(this.identifier, this);
  }

  /**
   * Called then the entity that this trait is attached to is spawned into a dimension.
   */
  public onSpawn?(): void;

  /**
   * Called when the entity that this trait is attached to is despawned from a dimension.
   */
  public onDespawn?(): void;

  /**
   * Called when the entity that this trait is attached to is interacted with by a player.
   * @param player The player that interacted with the entity.
   */
  public onInteract?(player: Player): void;

  /**
   * Clones the entity trait.
   * @param entity The entity to clone the trait to.
   * @returns A new entity trait.
   */
  public clone(entity: Entity): this {
    // Create a new instance of the trait.
    const trait = new (this.constructor as new (
      entity: Entity,
      identifier: string
    ) => EntityTrait)(entity, this.identifier) as this;

    // Copy the key-value pairs.
    for (const [key, value] of Object.entries(this)) {
      // Skip the entity.
      if (key === "entity") continue;

      // @ts-expect-error
      trait[key] = value;
    }

    // Return the trait.
    return trait;
  }
}

export { EntityTrait };
