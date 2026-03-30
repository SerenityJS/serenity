import { Observable } from "../observable";
import { BooleanProperty, ObjectProperty } from "../properties";

import { Element } from "./element";

interface DividerElementOptions {
  visible?: boolean | Observable<boolean>;
}

class DividerElement extends Element<void> {
  /**
   * Create a new divider element with the specified options and parent.
   * @param options The options for the divider element.
   * @param parent The parent object property of the divider element, or null if it has no parent.
   */
  public constructor(
    options: DividerElementOptions = {},
    parent: ObjectProperty | null = null
  ) {
    super("divider", parent);

    // Set the visibility of the element based on the options provided, defaulting to true if not specified.
    this.setVisibility(options.visible ?? true);
  }

  /**
   * Set the visibility of the element, which can be a boolean value or an observable that emits boolean values.
   * @param visible The visibility of the element, which can be a boolean value or an observable that emits boolean values.
   * @returns The current instance of the ButtonElement class to allow for method chaining.
   */
  public setVisibility(visible: boolean | Observable<boolean>): this {
    // Call the super method to set the visibility of the button element.
    super.setVisibility(visible);

    // NOTE: Dividers require an additional property to control the visibility of the button itself, separate from the visibility of the entire element.
    // Create a new boolean property for the visible state of the element, with the name "divider_visible" and the current element as its parent.
    const property = new BooleanProperty(
      "divider_visible",
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

export { DividerElement, DividerElementOptions };
