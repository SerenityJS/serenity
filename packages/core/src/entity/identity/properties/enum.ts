import { EntityPropertyType } from "@serenityjs/protocol";
import { ListTag, StringTag, TagType } from "@serenityjs/nbt";

import { EntityProperty, type EntityPropertyData } from "./property";

interface EntityEnumPropertyData extends EntityPropertyData {
  /**
   * The strings that the property can take.
   */
  enum: ListTag<StringTag>;
}

class EntityEnumProperty extends EntityProperty<EntityEnumPropertyData> {
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
        .getTag<ListTag<StringTag>>("enum")
        ?.value.map((tag) => tag.value) ?? []
    );
  }

  /**
   * Set the enum values of the property.
   * @param values The strings that the property can take.
   */
  public setEnum(values: Array<string>): void {
    this.compound.createListTag<StringTag>({
      name: "enum",
      value: values.map((value) => new StringTag({ name: "value", value })),
      listType: TagType.String
    });
  }
}

export { EntityEnumProperty, EntityEnumPropertyData };
