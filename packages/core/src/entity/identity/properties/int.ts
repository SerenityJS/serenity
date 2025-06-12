import { EntityPropertyType } from "@serenityjs/protocol";
import { IntTag } from "@serenityjs/nbt";

import { EntityProperty } from "./property";

class EntityIntProperty extends EntityProperty {
  /**
   * The current value of the property.
   */
  public currentValue: number = 0;

  /**
   * Create a new entity int property.
   * @param identifier The identifier of the property.
   * @param min The minimum value of the property.
   * @param max The maximum value of the property.
   * @param defaultValue The default value of the property.
   */
  public constructor(
    identifier: string,
    min: number,
    max: number,
    defaultValue?: number
  ) {
    super(EntityPropertyType.Int, identifier);

    // Set the current value of the property
    this.currentValue = defaultValue ?? min;

    // Set the min and max values of the property
    this.setMin(min);
    this.setMax(max);
  }

  /**
   * Get the minimum value of the property.
   * @returns The minimum value of the property.
   */
  public getMin(): number {
    return this.compound.get<IntTag>("min")?.valueOf() ?? 0;
  }

  /**
   * Set the minimum value of the property.
   * @param min The minimum value of the property.
   */
  public setMin(min: number): void {
    this.compound.add(new IntTag(min, "min"));
  }

  /**
   * Get the maximum value of the property.
   * @returns The maximum value of the property.
   */
  public getMax(): number {
    return this.compound.get<IntTag>("max")?.valueOf() ?? 0;
  }

  /**
   * Set the maximum value of the property.
   * @param max The maximum value of the property.
   */
  public setMax(max: number): void {
    this.compound.add(new IntTag(max, "max"));
  }
}

export { EntityIntProperty };
