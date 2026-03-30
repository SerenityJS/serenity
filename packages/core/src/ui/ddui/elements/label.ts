import { Observable } from "../observable";
import { BooleanProperty, ObjectProperty, StringProperty } from "../properties";

import { Element } from "./element";

interface LabelElementOptions {
  /**
   * Whether the label element is visible or hidden in the user interface of the custom form.
   */
  visible?: boolean | Observable<boolean>;
}

class LabelElement extends Element<void> {
  /**
   * Create a new label element with the specified text, options, and parent.
   * @param text The text of the label element.
   * @param options The options for the label element.
   * @param parent The parent object property of the label element, or null if it has no parent.
   */
  public constructor(
    text: string | Observable<string>,
    options: LabelElementOptions = {},
    parent: ObjectProperty | null = null
  ) {
    super("label", parent);

    // Set the text and visibility of the label element based on the parameters provided.
    this.setText(text).setVisibility(options.visible ?? true);
  }

  /**
   * Get the text of the label element.
   * @returns The text of the label element, or an empty string if the text property does not exist.
   */
  public getText(): string {
    // Get the text property from the data object of the element.
    const property = this.getProperty("text");

    // Check if the property exists and is a StringProperty.
    if (property instanceof StringProperty) {
      // If it is, return the value of the text property.
      return property.value;
    }

    // If the text property does not exist, return an empty string.
    return "";
  }

  /**
   * Set the text of the label element, which can be a string value or an observable that emits string values.
   * @param text The text of the label element, which can be a string value or an observable that emits string values.
   * @returns The current instance of the LabelElement class to allow for method chaining.
   */
  public setText(text: string | Observable<string>): this {
    // Fetch the text property from the data object of the element, or create a new StringProperty if it does not exist.
    let property = this.getProperty("text") as StringProperty | null;
    if (!property) {
      // Create a new StringProperty for the text of the label element, with the name "text" and the current element as its parent.
      property = new StringProperty("text", "", this as ObjectProperty);
    }

    // Check if the text value is an observable.
    if (text instanceof Observable) {
      // Set the property in the data object of the element to the current value of the observable.
      property.value = text.getValue();

      // Add a listener to the observable text value that updates the text property whenever the value of the observable changes.
      text.subscribe((value) => {
        // Set the value of the text property to the updated value from the observable.
        this.setText(value);

        // Return the property related to the observable.
        // This will send a DataStoreUpdate to the related clients.
        return property;
      });
    } else {
      // Set the property in the data object of the element.
      property.value = text;
    }

    // Set the property in the data object of the element.
    this.setProperty(property);

    // Return the current instance of the Element class to allow for method chaining.
    return this;
  }

  /**
   * Set the visibility of the element, which can be a boolean value or an observable that emits boolean values.
   * @param visible The visibility of the element, which can be a boolean value or an observable that emits boolean values.
   * @returns The current instance of the LabelElement class to allow for method chaining.
   */
  public setVisibility(visible: boolean | Observable<boolean>): this {
    // Call the super method to set the visibility of the Label element.
    super.setVisibility(visible);

    // NOTE: Labels require an additional property to control the visibility of the Label itself, separate from the visibility of the entire element.
    // Create a new boolean property for the visible state of the element, with the name "header_visible" and the current element as its parent.
    const property = new BooleanProperty(
      "header_visible",
      true,
      this as ObjectProperty
    );

    // Check if the visible value is an observable.
    if (visible instanceof Observable) {
      // Set the property in the data object of the element to the current value of the observable.
      property.value = visible.getValue();

      // Add a listener to the observable visible value that updates the visible property whenever the value of the observable changes.
      visible.subscribe((value) => {
        // Set the value of the visible property to the updated value from the observable.
        this.setVisibility(value);

        // Return the property related to the observable.
        // This will send a DataStoreUpdate to the related clients.
        return property;
      });
    } else {
      // Set the property in the data object of the element.
      property.value = visible;
    }

    // Set the property in the data object of the element.
    this.setProperty(property);

    // Return the current instance of the Element class to allow for method chaining.
    return this;
  }
}

export { LabelElement, LabelElementOptions };
