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
    super(EntityPropertyType.Enum, identifier);

    // Check if the values are empty
    if (!values[0]) throw new Error("Values cannot be empty");

    // Set the enum values of the property
    this.setEnum(values);

    // Set the current value of the property
    this.currentValue = values[values.indexOf(defaultValue ?? values[0])] ?? "";
  }

  /**
   * Get the enum values of the property.
   */
  public getEnum(): Array<string> {
    const enumTag = this.compound.get<ListTag<StringTag>>("enum");
    if (!enumTag) return [];
    return enumTag.map((tag) => tag.valueOf());
  }

  /**
   * Set the enum values of the property.
   * @param values The strings that the property can take.
   */
  public setEnum(values: Array<string>): void {
    const enumTags = values.map((value) => new StringTag(value));
    const enumListTag = new ListTag<StringTag>(enumTags, "enum");
    this.compound.add(enumListTag);
  }
}

export { EntityEnumProperty };
