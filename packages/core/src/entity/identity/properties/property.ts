import { CompoundTag, IntTag, StringTag } from "@serenityjs/nbt";
import { EntityPropertyType } from "@serenityjs/protocol";

interface EntityPropertyData {
  /**
   * The name of the property.
   */
  name: StringTag;

  /**
   * The type of the property.
   */
  type: IntTag;
}

class EntityProperty<T = EntityPropertyData> {
  /**
   * The compound tag that contains the property data.
   */
  public readonly compound = new CompoundTag<T>();

  /**
   * The current value of the property.
   */
  public currentValue: number | string | boolean = 0;

  /**
   * Create a new entity property.
   * @param type The type of the property.
   * @param identifier The identifier of the property.
   */
  public constructor(type: EntityPropertyType, identifier: string) {
    // Set the type and identifier of the property
    this.setType(type);
    this.setIdentifier(identifier);
  }

  /**
   * Set the identifier of the property.
   * @param identifier The identifier of the property.
   * @returns The entity property.
   */
  public setIdentifier(identifier: string): void {
    this.compound.createStringTag({ name: "name", value: identifier });
  }

  /**
   * Get the identifier of the property.
   * @returns The identifier of the property.
   */
  public getIdentifier(): string {
    return this.compound.getTag<StringTag>("name")?.value ?? "";
  }

  /**
   * Set the type of the property.
   * @param type The type of the property.
   * @returns The entity property.
   */
  public setType(type: EntityPropertyType): void {
    this.compound.createIntTag({ name: "type", value: type });
  }

  /**
   * Get the type of the property.
   * @returns The type of the property.
   */
  public getType(): EntityPropertyType {
    return this.compound.getTag<IntTag>("type")?.value ?? -1;
  }
}

export { EntityProperty, EntityPropertyData };
