import { Attribute, AttributeName } from "@serenityjs/protocol";

import { Entity } from "../entity";
import { WorldEvent } from "../enums";

import { EventSignal } from "./event-signal";

class EntityAttributeUpdateSignal extends EventSignal {
  public static readonly identifier = WorldEvent.EntityAttributeUpdate;

  /**
   * The entity in which the attribute was updated.
   */
  public readonly entity: Entity;

  /**
   * The attribute that was updated.
   */
  public readonly attribute: AttributeName;

  /**
   * The new value of the attribute.
   */
  public readonly value: Attribute;

  /**
   * Create a new entity attribute update event.
   * @param entity The entity in which the attribute was updated.
   * @param attribute The attribute that was updated.
   * @param value The new value of the attribute.
   */
  public constructor(
    entity: Entity,
    attribute: AttributeName,
    value: Attribute
  ) {
    super(entity.world);
    this.entity = entity;
    this.attribute = attribute;
    this.value = value;
  }
}

export { EntityAttributeUpdateSignal };
