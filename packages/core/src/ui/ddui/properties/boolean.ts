import { DataStorePropertyValueType } from "@serenityjs/protocol";

import { DataDrivenProperty } from "./property";
import { ObjectProperty } from "./object";

class BooleanProperty extends DataDrivenProperty<boolean, boolean> {
  /**
   * The type of the property, used for serialization and deserialization purposes.
   */
  public readonly type = DataStorePropertyValueType.Boolean;

  /**
   * Create a new boolean property with the given name and value.
   * @param name The name of the property, used for identification and referencing purposes.
   * @param value The value of the property, which can be of various types depending on the specific implementation and use case.
   * @param parent The parent property of the current property, which can be used to establish a hierarchical relationship between properties and allow for proper referencing and access within the object hierarchy when serialized and deserialized.
   */
  public constructor(
    name: string,
    value: boolean,
    parent: ObjectProperty | null = null
  ) {
    super(name, value, parent);
  }
}

export { BooleanProperty };
