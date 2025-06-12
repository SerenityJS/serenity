import { EntityPropertyType } from "@serenityjs/protocol";
import { ListTag, StringTag } from "@serenityjs/nbt";

import { EntityProperty } from "./property";

class EntityEnumProperty extends EntityProperty {
  /**
   * The current value of the property.
   */
  public currentValue: string;

  /**
   * Create a new entity float property.
   * @param identifier The identifier of the property.
   * @param values The strings that the property can take.
   * @param defaultValue The default value of the property.
   */
  public constructor(
    identifier: string,
    values: Array<string>,
    defaultValue?: string
  ) {
    super(EntityPropertyType.Float, identifier);

    // Check if the values are empty
    if (!values[0]) throw new Error("Values cannot be empty");

    // Set the current value of the property
    this.currentValue = values[values.indexOf(defaultValue ?? values[0])] ?? "";
  }

  /**
   * Get the enum values of the property.
   */
  public getEnum(): Array<string> {
    return (
      this.compound
        .get<ListTag<StringTag>>("enum")
        ?.map((tag) => tag.valueOf()) ?? []
    );
  }

  /**
   * Set the enum values of the property.
   * @param values The strings that the property can take.
   */
  public setEnum(values: Array<string>): void {
    this.compound.add(
      new ListTag<StringTag>(
        values.map((value) => new StringTag(value)),
        "enum"
      )
    );
  }
}

export { EntityEnumProperty };
