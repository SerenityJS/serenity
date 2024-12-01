import { Attribute, AttributeName } from "@serenityjs/protocol";

import { EntityTrait } from "../trait";

interface AttributeProperties {
  minimumValue?: number;
  maximumValue?: number;
  defaultValue?: number;
  currentValue?: number;
}

class EntityAttributeTrait extends EntityTrait {
  /**
   * The attribute name associated with the trait
   */
  public attribute!: AttributeName;

  /**
   * Whether the trait will be synchronized with the client
   */
  public sync = true;

  /**
   * The minimum value of the attribute
   */
  public get minimumValue(): number {
    // Get the attribute from the entity
    const attribute = this.getAttribute();

    // Return the minimum value of the attribute
    return attribute.min;
  }

  /**
   * The minimum value of the attribute
   */
  public set minimumValue(value: number) {
    // Get the attribute from the entity
    const attribute = this.getAttribute();

    // Set the minimum value of the attribute
    attribute.min = value;

    // Update the attribute in the entity
    this.entity.attributes.add(attribute);
  }

  /**
   * The maximum value of the attribute
   */
  public get maximumValue(): number {
    // Get the attribute from the entity
    const attribute = this.getAttribute();

    // Return the maximum value of the attribute
    return attribute.max;
  }

  /**
   * The maximum value of the attribute
   */
  public set maximumValue(value: number) {
    // Get the attribute from the entity
    const attribute = this.getAttribute();

    // Set the maximum value of the attribute
    attribute.max = value;

    // Update the attribute in the entity
    this.entity.attributes.add(attribute);
  }

  /**
   * The default value of the attribute
   */
  public get defaultValue(): number {
    // Get the attribute from the entity
    const attribute = this.getAttribute();

    // Return the default value of the attribute
    return attribute.default;
  }

  /**
   * The default value of the attribute
   */
  public set defaultValue(value: number) {
    // Get the attribute from the entity
    const attribute = this.getAttribute();

    // Set the default value of the attribute
    attribute.default = value;

    // Update the attribute in the entity
    this.entity.attributes.add(attribute);
  }

  /**
   * The current value of the attribute
   */
  public get currentValue(): number {
    // Get the attribute from the entity
    const attribute = this.getAttribute();

    // Return the current value of the attribute
    return attribute.current;
  }

  /**
   * The current value of the attribute
   */
  public set currentValue(value: number) {
    // Get the attribute from the entity
    const attribute = this.getAttribute();

    // Set the current value of the attribute
    attribute.current = value;

    // Update the attribute in the entity
    this.entity.attributes.add(attribute);
  }

  /**
   * Gets the saturation attribute of the entity
   * @returns The saturation attribute of the entity
   */
  public getAttribute(): Attribute {
    return this.entity.attributes.get(this.attribute) as Attribute;
  }

  /**
   * Resets the current value of the attribute to the default value
   */
  public reset(): void {
    // Reset the current value of the attribute to the default value
    this.currentValue = this.defaultValue;
  }

  public onAdd(properties?: AttributeProperties): void {
    // Check if the entity has a saturation attribute
    if (!this.entity.attributes.has(this.attribute)) {
      // If not, create a new saturation attribute for the entity
      const attribute = new Attribute(
        properties?.minimumValue ?? 0,
        properties?.maximumValue ?? 0,
        properties?.currentValue ?? 0,
        -Infinity,
        Infinity,
        properties?.defaultValue ?? 0,
        this.attribute,
        []
      );

      // Add the attribute to the entity
      this.entity.attributes.add(attribute);
    }
  }

  public onRemove(): void {
    // Remove the saturation attribute from the entity
    this.entity.attributes.delete(this.attribute);
  }
}

export { EntityAttributeTrait };
