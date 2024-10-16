import { Attribute, AttributeName } from "@serenityjs/protocol";

import { EntityTrait } from "../trait";
import { JSONLikeObject } from "../../../types";

interface AttributeProperties extends JSONLikeObject {
  attribute: AttributeName;
  current: number;
  effectiveMin: number;
  effectiveMax: number;
  defaultValue: number;
}

class EntityAttributeTrait extends EntityTrait {
  /**
   * The attribute name associated with the trait
   */
  public attribute!: AttributeName;

  /**
   * The minimum value of the attribute
   */
  public effectiveMin: number = 0;

  /**
   * The maximum value of the attribute
   */
  public effectiveMax: number = 0;

  /**
   * The default value of the attribute
   */
  public defaultValue: number = 0;

  /**
   * Get the current value of the attribute
   * @returns Whether the attribute is enabled or not
   */
  public get(): AttributeProperties {
    // Get the component value from the entity
    return this.entity.components.get(this.identifier) as AttributeProperties;
  }

  /**
   * Set the current value of the attribute
   * @param value Whether the attribute is enabled or not
   * @param update Whether to update the entity's actor data; default is true
   */
  public set(value: number): void {
    // Create a new attribute properties object
    const properties: AttributeProperties = {
      attribute: this.attribute,
      current: value,
      effectiveMin: this.effectiveMin,
      effectiveMax: this.effectiveMax,
      defaultValue: this.defaultValue
    };

    // Create a new attribute object
    const attribute = new Attribute(
      this.effectiveMin,
      this.effectiveMax,
      value,
      -Infinity,
      Infinity,
      this.defaultValue,
      this.attribute,
      []
    );

    // Update the component value
    this.entity.components.set(this.identifier, properties);
    this.entity.attributes.set(this.attribute, attribute);
  }

  public onSpawn(): void {
    // Check if the entity has the component
    if (this.entity.components.has(this.identifier)) {
      // Get the component value from the entity
      const enabled = this.entity.components.get(
        this.identifier
      ) as AttributeProperties;

      // Set the entity flag
      this.set(enabled.current);
    } else {
      // Set the component value to the default value
      this.set(this.defaultValue);
    }
  }
}

export { EntityAttributeTrait };
