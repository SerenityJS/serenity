import { ActorFlag } from "@serenityjs/protocol";

import { Entity } from "../entity";
import { WorldEvent } from "../enums";

import { EventSignal } from "./event-signal";

class EntityFlagUpdateSignal extends EventSignal {
  public readonly identifier = WorldEvent.EntityFlagUpdate;

  /**
   * The entity in which the flag was updated.
   */
  public readonly entity: Entity;

  /**
   * The flag that was updated.
   */
  public readonly flag: ActorFlag;

  /**
   * The new value of the flag.
   */
  public value: boolean;

  /**
   * Create a new entity flag update event.
   * @param entity The entity in which the flag was updated.
   * @param flag The flag that was updated.
   * @param value The new value of the flag.
   */
  public constructor(entity: Entity, flag: ActorFlag, value: boolean) {
    super(entity.world);
    this.entity = entity;
    this.flag = flag;
    this.value = value;
  }
}

export { EntityFlagUpdateSignal };
