import { DataStorePropertyValueType } from "@serenityjs/protocol";
import { DataStorePropertyDynamicValue } from "@serenityjs/protocol/src/proto/types/data-store-property-value";

import { DataDrivenProperty } from "./property";
import { StringProperty } from "./string";
import { BooleanProperty } from "./boolean";
import { LongProperty } from "./long";

type ObjectPropertyValueType =
  | BooleanProperty
  | StringProperty
  | LongProperty
  | ObjectProperty;

type ObjectPropertyInterface = Map<string, ObjectPropertyValueType>;

class ObjectProperty<T = unknown> extends DataDrivenProperty<
  ObjectPropertyInterface,
  T
> {
  /**
   * The type of the property, used for serialization and deserialization purposes.
   */
  public readonly type = DataStorePropertyValueType.Type;

  /**
   * Create a new string property with the given name and value.
   * @param name The name of the property, used for identification and referencing purposes.
   * @param parent The parent property of the current property, which can be used to establish a hierarchical relationship between properties and allow for proper referencing and access within the object hierarchy when serialized and deserialized.
   */
  public constructor(name: string, parent: ObjectProperty | null = null) {
    super(name, new Map(), parent);
  }

  /**
   * Get a property by name.
   * @param name The name of the property to get.
   * @returns The property with the given name, or null if it does not exist.
   */
  public getProperty(name: string): ObjectPropertyValueType | null {
    return this.value.get(name) ?? null;
  }

  /**
   * Set a property in the object.
   * @param property The property to set.
   */
  public setProperty(property: ObjectPropertyValueType): void {
    this.value.set(property.name, property);
  }

  public toJson(): DataStorePropertyDynamicValue {
    const obj: DataStorePropertyDynamicValue = {};

    for (const [key, property] of this.value) {
      if (property instanceof ObjectProperty) {
        obj[key] = {
          type: property.type,
          value: property.toJson()
        };
      } else {
        obj[key] = {
          type: property.type,
          value: property.value
        };
      }
    }

    return obj;
  }
}

export { ObjectProperty, ObjectPropertyInterface, ObjectPropertyValueType };
