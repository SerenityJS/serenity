import { Observable } from "../observable";
import { BooleanProperty, ObjectProperty, StringProperty } from "../properties";

import { ButtonClickElement } from "./button-click";
import { Element } from "./element";

interface ButtonOptions {
  /**
   * Whether the button is disabled or not, which determines whether the button is interactive and can be clicked by users.
   * A disabled button is typically grayed out and does not respond to user interactions, while an enabled button is active and can trigger actions when clicked.
   */
  disabled?: boolean | Observable<boolean>;

  /**
   * The label to be displayed on the button, which is a string value that represents the text shown on the button, allowing users to understand its purpose and function within the user interface.
   */
  tooltip?: string | Observable<string>;

  /**
   * Whether the button is visible or hidden in the user interface, which allows for dynamic control over the visibility of the button based on specific conditions or user interactions.
   */
  visible?: boolean | Observable<boolean>;
}

class ButtonElement extends Element<bigint> {
  /**
   * Create a new button element with the given parent object property and options.
   * @param label The label to be displayed on the button, which is a string value that represents the text shown on the button, allowing users to understand its purpose and function within the user interface.
   * @param options The options for configuring the button, including the label to be displayed on the button and whether the button is visible or hidden in the user interface.
   * @param parent The parent object property to which this button element will be added, allowing it to be included in the overall configuration of the custom form.
   */
  public constructor(
    label: string | Observable<string>,
    options: ButtonOptions = {},
    parent: ObjectProperty | null = null
  ) {
    super("button", parent);

    // Set the label, button visibility, and onClick properties based on the provided options, with default values if not specified.
    this.setLabel(label)
      .setToolTip(options.tooltip ?? "")
      .setVisibility(options.visible ?? true)
      .setDisabled(options.disabled ?? false);

    // Create a new button click element and set it as a property of the button element.
    const buttonClickListener = new ButtonClickElement(this as ObjectProperty);
    this.setProperty(buttonClickListener);

    // Add a listener to the button click element that triggers the button element's listeners when clicked.
    buttonClickListener.addListener(this.triggerListeners.bind(this));
  }

  /**
   * Get the tooltip of the button element, which is a string value that represents the text shown when hovering over the button.
   * @returns The value of the tooltip property.
   */
  public getToolTip(): string {
    // Get the tooltip property from the data object of the element.
    const property = this.getProperty("tooltip");

    // Check if the tooltip property exists and is an instance of StringProperty.
    if (property instanceof StringProperty) {
      // Return the value of the tooltip property.
      return property.value;
    }

    // If the tooltip property does not exist or is not an instance of StringProperty, return an empty string as the default value.
    return "";
  }

  /**
   * Set the tooltip to be displayed when hovering over the button.
   * @param tooltip The tooltip to be displayed when hovering over the button.
   * @returns The current instance of the ButtonElement class to allow for method chaining.
   */
  public setToolTip(tooltip: string | Observable<string>): this {
    // Create a new string property for the tooltip of the button element, with the name "tooltip" and the current element as its parent.
    const property = new StringProperty("tooltip", "", this as ObjectProperty);

    // Check if the tooltip value is an observable.
    if (tooltip instanceof Observable) {
      // Set the property in the data object of the element to the current value of the observable.
      property.value = tooltip.getValue();

      // Add a listener to the observable tooltip value that updates the tooltip property whenever the value of the observable changes.
      tooltip.subscribe((value) => {
        // Set the value of the tooltip property to the updated value from the observable.
        this.setToolTip(value);

        // Return the property related to the observable.
        // This will send a DataStoreUpdate to the related clients.
        return property;
      });
    } else {
      // Set the property in the data object of the element.
      property.value = tooltip;
    }

    // Set the property in the data object of the element.
    this.setProperty(property);

    // Return the current instance of the ButtonElement class to allow for method chaining.
    return this;
  }

  /**
   * Set the visibility of the element, which can be a boolean value or an observable that emits boolean values.
   * @param visible The visibility of the element, which can be a boolean value or an observable that emits boolean values.
   * @returns The current instance of the ButtonElement class to allow for method chaining.
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

export { ButtonElement, type ButtonOptions };
