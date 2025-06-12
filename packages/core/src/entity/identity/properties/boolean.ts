import { EntityPropertyType } from "@serenityjs/protocol";

import { EntityProperty } from "./property";

class EntityBooleanProperty extends EntityProperty {
  /**
   * The current value of the property.
   */
  public currentValue: boolean = false;

  /**
   * Create a new entity boolean property.
   * @param identifier The identifier of the property.
   * @param defaultValue The default value of the property.
   */
  public constructor(identifier: string, defaultValue?: boolean) {
    super(EntityPropertyType.Boolean, identifier);

    // Set the currrent value of the property
    this.currentValue = defaultValue ?? false;
  }
}

export { EntityBooleanProperty };
