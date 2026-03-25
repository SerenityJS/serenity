import { Observable } from "../observable";
import { BooleanProperty, ObjectProperty } from "../properties";

import { ButtonClickElement } from "./button-click";
import { Element } from "./element";

interface CloseButtonOptions {
  /**
   * The label to be displayed on the close button.
   * This is a string value that represents the text shown on the button, allowing users to understand its purpose and function within the user interface.
   */
  label?: string | Observable<string>;

  /**
   * A boolean value that determines whether the close button is visible or hidden in the user interface.
   * If set to true, the button will be displayed; if set to false, it will be hidden from view, allowing for dynamic control over the visibility of the close button based on specific conditions or user interactions.
   */
  visible?: boolean | Observable<boolean>;
}

class CloseButtonElement extends Element<bigint> {
  /**
   * The name of the property, used for identification and referencing purposes.
   * This is a fixed value that identifies this property as the close button configuration for a custom form.
   */
  public readonly name = "closeButton";

  /**
   * Create a new close button element with the given parent object property and options.
   * @param parent The parent object property to which this close button element will be added, allowing it to be included in the overall configuration of the custom form.
   * @param options The options for configuring the close button, including the label to be displayed on the button and whether the button is visible or hidden in the user interface.
   */
  public constructor(
    options: CloseButtonOptions = {},
    parent: ObjectProperty | null = null
  ) {
    super("closeButton", parent);

    // Set the label, button visibility, and onClick properties based on the provided options, with default values if not specified.
    this.setLabel(options.label ?? "Close");
    this.setVisibility(options.visible ?? true);

    // Create a new button click element and set it as a property of the button element.
    const buttonClickListener = new ButtonClickElement(this as ObjectProperty);
    this.setProperty(buttonClickListener);

    // Add a listener to the button click element that triggers the button element's listeners when clicked.
    buttonClickListener.addListener(this.triggerListeners.bind(this));
  }

  /**
   * Set the visibility of the element, which can be a boolean value or an observable that emits boolean values.
   * @param visible The visibility of the element, which can be a boolean value or an observable that emits boolean values.
   * @returns The current instance of the Element class to allow for method chaining.
   */
  public setVisibility(visible: boolean | Observable<boolean>): this {
    // Call the super method to set the visibility of the button element.
    super.setVisibility(visible);

    // NOTE: Buttons require an additional property to control the visibility of the button itself, separate from the visibility of the entire element.
    // Create a new boolean property for the visible state of the element, with the name "button_visible" and the current element as its parent.
    const property = new BooleanProperty(
      "button_visible",
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

export { CloseButtonElement, type CloseButtonOptions };
