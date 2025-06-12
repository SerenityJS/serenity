import { CompoundTag, IntTag, StringTag } from "@serenityjs/nbt";
import { EntityPropertyType } from "@serenityjs/protocol";

class EntityProperty {
  /**
   * The compound tag that contains the property data.
   */
  public readonly compound = new CompoundTag();

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
    this.compound.add(new StringTag(identifier, "name"));
  }

  /**
   * Get the identifier of the property.
   * @returns The identifier of the property.
   */
  public getIdentifier(): string {
    return this.compound.get<StringTag>("name")?.valueOf() ?? "";
  }

  /**
   * Set the type of the property.
   * @param type The type of the property.
   * @returns The entity property.
   */
  public setType(type: EntityPropertyType): void {
    this.compound.add(new IntTag(type, "type"));
  }

  /**
   * Get the type of the property.
   * @returns The type of the property.
   */
  public getType(): EntityPropertyType {
    return this.compound.get<IntTag>("type")?.valueOf() ?? -1;
  }
}

export { EntityProperty };
