import {
  LongProperty,
  ObjectProperty,
  ObjectPropertyValueType
} from "../properties";

class LayoutElement extends ObjectProperty {
  /**
   * Create a new layout element with the default name "layout", which serves as the container for organizing and structuring other elements within the user interface of a custom form.
   * The layout element allows for the arrangement and grouping of various UI components, enabling developers to create visually appealing and user-friendly interfaces for their custom forms.
   */
  public constructor(parent: ObjectProperty | null = null) {
    super("layout", parent);
  }

  /**
   * Add a new element to the layout with the given name and value.
   * @param property The object property representing the element to be added to the layout.
   */
  public setProperty(property: ObjectPropertyValueType): void {
    // Get the current number of properties in the layout object property, which represents the number of elements currently added to the custom form.
    const count = this.getPropertyCount();

    // Set the name of the property to be added based on the current count, which allows for unique identification and referencing of each element within the layout of the custom form.
    property.name = count.toString();

    // Call the setProperty method of the parent ObjectProperty class to add the property to the layout.
    super.setProperty(property);

    // Set the length property of the layout object property to reflect the updated number of elements in the layout.
    super.setProperty(new LongProperty("length", BigInt(count + 1), this));
  }

  /**
   * Get the number of properties in the object.
   * @returns The number of properties in the object.
   */
  private getPropertyCount(): number {
    // Get the current number of properties in the value map of the object property, which represents the total number of properties currently set in the object.
    let count = this.value.size;

    // Check if the object property has a "length" property.
    if (this.value.has("length")) count -= 1; // Decrease the count by 1 to exclude length.

    // Return the final count of properties in the object.
    return count;
  }
}

export { LayoutElement };
