import { EntityPropertyType } from "@serenityjs/protocol";

import { EntityProperty, type EntityPropertyData } from "./property";

import type { IntTag } from "@serenityjs/nbt";

interface EntityIntPropertyData extends EntityPropertyData {
  /**
   * The minimum value of the property.
   */
  min: IntTag;

  /**
   * The maximum value of the property.
   */
  max: IntTag;
}

class EntityIntProperty extends EntityProperty<EntityIntPropertyData> {
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
    return this.compound.getTag<IntTag>("min")?.value ?? 0;
  }

  /**
   * Set the minimum value of the property.
   * @param min The minimum value of the property.
   */
  public setMin(min: number): void {
    this.compound.createIntTag({ name: "min", value: min });
  }

  /**
   * Get the maximum value of the property.
   * @returns The maximum value of the property.
   */
  public getMax(): number {
    return this.compound.getTag<IntTag>("max")?.value ?? 0;
  }

  /**
   * Set the maximum value of the property.
   * @param max The maximum value of the property.
   */
  public setMax(max: number): void {
    this.compound.createIntTag({ name: "max", value: max });
  }
}

export { EntityIntProperty, EntityIntPropertyData };
