import { Player } from "../../../entity";
import { Observable } from "../observable";
import {
  BooleanProperty,
  LongProperty,
  ObjectProperty,
  StringProperty
} from "../properties";

import { Element } from "./element";
import { LayoutElement } from "./layout";

interface DropdownElementOptions {
  /**
   * A description of the dropdown element.
   */
  description?: string | Observable<string>;

  /**
   * Whether the dropdown element is disabled.
   */
  disabled?: boolean | Observable<boolean>;

  /**
   * Whether the dropdown element is visible.
   */
  visible?: boolean | Observable<boolean>;
}

interface DropdownElementItem {
  description?: string;

  label: string;

  value: number;
}

class DropdownElement extends Element<number> {
  public constructor(
    label: string | Observable<string>,
    private readonly currentValue: Observable<number>,
    items: Array<DropdownElementItem>,
    options: DropdownElementOptions = {},
    parent: ObjectProperty | null = null
  ) {
    super("dropdown", parent);

    this.setLabel(label)
      .setVisibility(options.visible ?? true)
      .setDisabled(options.disabled ?? false)
      .setValue(this.currentValue)
      .setItems(items);
  }

  /**
   * Get the value of the dropdown element, which is a number that represents the current position of the dropdown. The value is typically displayed to users as they interact with the dropdown in the user interface of the custom form. The value can be updated dynamically based on user interactions with the dropdown, allowing for real-time feedback and updates to other elements or data in the form that may be dependent on the dropdown's value.
   * @returns The value of the dropdown element. If the value property does not exist or is not an instance of LongProperty, it returns 0 as the default value. This allows for a fallback value to ensure that the dropdown has a valid value even if it has not been explicitly set or if there is an issue with the property configuration.
   */
  public getValue(): number {
    // Get the value property from the data object of the element.
    const property = this.getProperty("value");

    // Check if the value property exists and is an instance of LongProperty.
    if (property instanceof LongProperty) {
      // Return the value of the value property as a number.
      return Number(property.value);
    }

    // If the value property does not exist or is not an instance of LongProperty, return 0 as the default value.
    return 0;
  }

  /**
   * Set the value of the dropdown element, which can be a number or an observable that emits number values.
   * @param value The value of the dropdown element, which can be a number or an observable that emits number values. The value represents the current position of the dropdown and is typically displayed to users as they interact with the dropdown in the user interface of the custom form. The value can be updated dynamically based on user interactions with the dropdown, allowing for real-time feedback and updates to other elements or data in the form that may be dependent on the dropdown's value.
   * @returns The current instance of the DropdownElement class to allow for method chaining. This allows for a fluent interface where multiple methods can be called in a chain on the same instance of the DropdownElement class, improving readability and ease of use when configuring the dropdown element in the custom form.
   */
  public setValue(value: number | Observable<number>): this {
    // Fetch the existing value property from the data object of the element.
    let property = this.getProperty("value") as LongProperty;
    if (!property) {
      // Create a new string property for the value of the value element, with the name "value" and the current element as its parent.
      property = new LongProperty("value", 0n, this as ObjectProperty);

      // Add a listener
      property.addListener((player, data) => {
        // Call the setValue method of the slidder observable to update its value and notify all subscribers.
        this.triggerListeners(player, Number(data));
      });
    }

    // Check if the value is an observable.
    if (value instanceof Observable) {
      // Set the property in the data object of the element to the current value of the observable.
      property.value = BigInt(value.getValue());

      // Add a listener to the observable value that updates the currentValue property whenever the value of the observable changes.
      value.subscribe((value) => {
        // Set the value of the currentValue property to the updated value from the observable.
        this.setValue(value);

        // Return the property related to the observable.
        // This will send a DataStoreUpdate to the related clients.
        return property;
      });
    } else {
      // Set the property in the data object of the element.
      property.value = BigInt(value);
    }

    // Set the property in the data object of the element.
    this.setProperty(property);

    // Return the current instance of the Element class to allow for method chaining.
    return this;
  }

  /**
   * Set the visibility of the element, which can be a boolean value or an observable that emits boolean values.
   * @param visible The visibility of the element, which can be a boolean value or an observable that emits boolean values.
   * @returns The current instance of the DropdownElement class to allow for method chaining.
   */
  public setVisibility(visible: boolean | Observable<boolean>): this {
    // Call the super method to set the visibility of the dropdown element.
    super.setVisibility(visible);

    // NOTE: dropdowns require an additional property to control the visibility of the dropdown itself, separate from the visibility of the entire element.
    // Create a new boolean property for the visible state of the element, with the name "dropdown_visible" and the current element as its parent.
    const property = new BooleanProperty(
      "dropdown_visible",
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

  /**
   * Set the items of the dropdown element, which is an array of objects that represent the options available in the dropdown. Each object in the array should have a label property that represents the text displayed for the option, a value property that represents the value associated with the option, and an optional description property that provides additional information about the option. The setItems method allows for dynamically configuring the options available in the dropdown based on user interactions or other data in the custom form, providing flexibility and interactivity to users as they interact with the dropdown element in the user interface of the custom form.
   * @param items The items of the dropdown element, which is an array of objects that represent the options available in the dropdown. Each object in the array should have a label property that represents the text displayed for the option, a value property that represents the value associated with the option, and an optional description property that provides additional information about the option. The setItems method allows for dynamically configuring the options available in the dropdown based on user interactions or other data in the custom form, providing flexibility and interactivity to users as they interact with the dropdown element in the user interface of the custom form.
   * @returns The current instance of the DropdownElement class to allow for method chaining. This allows for a fluent interface where multiple methods can be called in a chain on the same instance of the DropdownElement class, improving readability and ease of use when configuring the dropdown element in the custom form.
   */
  public setItems(items: Array<DropdownElementItem>): this {
    // Create a new layout element to hold the items of the dropdown, with the name "items" and the current element as its parent.
    const layout = new LayoutElement("items", this as ObjectProperty);

    // Iterate over the items array and create an object property for each item, setting the label, value, and description properties
    for (const { label, value, description } of items) {
      // Create a new object property for the item, with the name "item" and the layout as its parent.
      const item = new ObjectProperty("item", layout);

      // Set the label, value, and description properties of the item object property based on the corresponding properties of the item in the items array.
      item.setProperty(new StringProperty("label", label, item));
      item.setProperty(new LongProperty("value", BigInt(value), item));

      if (description)
        item.setProperty(new StringProperty("description", description, item));

      // Set the item object property in the layout object property to add it to the dropdown's items.
      layout.setProperty(item);
    }

    // Set the layout object property in the data object of the element to add the items to the dropdown element.
    this.setProperty(layout);

    // Return the current instance of the Element class to allow for method chaining.
    return this;
  }

  public triggerListeners(player: Player, data: number): void {
    // Call the superclass method to trigger all listeners
    super.triggerListeners(player, data);

    // Set the slidder value to the updated value from the listener trigger.
    this.setValue(data);

    // Call the setValue method of the slidder observable to update its value and notify all subscribers of the new value, allowing them to react to the change as needed.
    this.currentValue.setValue(data);
  }
}

export { DropdownElement, DropdownElementItem, DropdownElementOptions };
