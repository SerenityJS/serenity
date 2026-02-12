import { Player } from "../../../entity";
import { Observable } from "../observable";
import { BooleanProperty, ObjectProperty, StringProperty } from "../properties";

import { Element } from "./element";

interface TextFieldOptions {
  /**
   * The description of the text field element, which is a string value that represents the additional information or instructions displayed below the text field in the user interface of the custom form.
   */
  description?: string | Observable<string>;

  /**
   * Whether the text field is disabled or not, which determines whether the text field is interactive and can be clicked by users.
   * A disabled text field is typically grayed out and does not respond to user interactions, while an enabled text field is active and can trigger actions when clicked.
   */
  disabled?: boolean | Observable<boolean>;

  /**
   * Whether the text field is visible or hidden in the user interface, which allows for dynamic control over the visibility of the text field based on specific conditions or user interactions.
   */
  visible?: boolean | Observable<boolean>;
}

class TextFieldElement extends Element<string> {
  /**
   * Create a new text field element with the given label, text observable, options, and parent object property.
   * @param label The label to be displayed on the text field.
   * @param text The observable that holds the current text value of the text field, allowing for dynamic updates and synchronization of the text value across different parts of the user interface and enabling real-time updates to the text field based on changes to the observable's value.
   * @param options The options for configuring the text field element, including the description of the text field, whether the text field is disabled or not, and whether the text field is visible or hidden in the user interface of the custom form.
   * @param parent The parent object property to which this text field element will be added, allowing it to be included in the overall configuration of the custom form.
   */
  public constructor(
    label: string | Observable<string>,
    private readonly text: Observable<string>,
    options: TextFieldOptions = {},
    parent: ObjectProperty | null = null
  ) {
    super("textField", parent);

    // Set the label, text, description, and visibility properties based on the provided options, with default values if not specified.
    this.setLabel(label)
      .setText(text)
      .setTextFieldVisible(options.visible ?? true)
      .setVisibility(options.visible ?? true)
      .setDisabled(options.disabled ?? false);
  }

  /**
   * Get whether the text field is visible or hidden in the user interface of the custom form.
   * @returns Whether the text field is visible or hidden in the user interface of the custom form.
   */
  public getTextFieldVisible(): boolean {
    // Get the text field visibility property from the data object of the element.
    const property = this.getProperty("textfield_visible");

    // Check if the text field visibility property exists and is an instance of BooleanProperty.
    if (property instanceof BooleanProperty) {
      // Return the value of the text field visibility property.
      return property.value;
    }

    // If the text field visibility property does not exist or is not an instance of BooleanProperty, return true as the default value.
    return true;
  }

  /**
   * Set whether the text field is visible or hidden in the user interface of the custom form.
   * @param visible Whether the text field is visible or hidden in the user interface of the custom form.
   * @returns The current instance of the TextFieldElement class to allow for method chaining.
   */
  public setTextFieldVisible(visible: boolean | Observable<boolean>): this {
    // Fetch the existing visible property from the data object of the element.
    let property = this.getProperty("textfield_visible") as BooleanProperty;
    if (!property) {
      // Create a new boolean property for the visibility of the text field element, with the name "textfield_visible" and the current element as its parent.
      property = new BooleanProperty(
        "textfield_visible",
        true,
        this as ObjectProperty
      );
    }

    // Check if the visible value is an observable.
    if (visible instanceof Observable) {
      // Set the property in the data object of the element to the current value of the observable.
      property.value = visible.getValue();

      // Add a listener to the observable visible value that updates the visible property whenever the value of the observable changes.
      visible.subscribe((value) => {
        // Set the value of the visible property to the updated value from the observable.
        this.setTextFieldVisible(value);

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

    // Return the current instance of the text fieldElement class to allow for method chaining.
    return this;
  }

  /**
   * Get the text of the text field element, which is a string value that represents the current text displayed in the text field of the custom form.
   * @return The text of the text field element.
   */
  public getText(): string {
    // Get the text property from the data object of the element.
    const property = this.getProperty("text");

    // Check if the text property exists and is an instance of StringProperty.
    if (property instanceof StringProperty) {
      // Return the value of the text property.
      return property.value;
    }

    // If the text property does not exist or is not an instance of StringProperty, return an empty string as the default value.
    return "";
  }

  /**
   * Set the text of the text field element, which can be a string value or an observable that emits string values.
   * @param text The text of the text field element, which can be a string value or an observable that emits string values.
   * @returns The current instance of the TextFieldElement class to allow for method chaining.
   */
  public setText(text: string | Observable<string>): this {
    // Fetch the existing text property from the data object of the element.
    let property = this.getProperty("text") as StringProperty;
    if (!property) {
      // Create a new string property for the text of the text field element, with the name "text" and the current element as its parent.
      property = new StringProperty("text", "", this as ObjectProperty);

      // Add a listener
      property.addListener(this.triggerListeners.bind(this));
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

    // Return the current instance of the TextFieldElement class to allow for method chaining.
    return this;
  }

  /**
   * Get the description of the text field element, which is a string value that represents the additional information or instructions displayed below the text field in the user interface of the custom form.
   * @returns The description of the text field element.
   */
  public getDescription(): string {
    // Get the description property from the data object of the element.
    const property = this.getProperty("description");

    // Check if the description property exists and is an instance of StringProperty.
    if (property instanceof StringProperty) {
      // Return the value of the description property.
      return property.value;
    }

    // If the description property does not exist or is not an instance of StringProperty, return an empty string as the default value.
    return "";
  }

  /**
   * Set the description of the text field element, which can be a string value or an observable that emits string values.
   * @param description The description of the text field element, which can be a string value or an observable that emits string values.
   * @returns The current instance of the TextFieldElement class to allow for method chaining.
   */
  public setDescription(description: string | Observable<string>): this {
    // Fetch the existing description property from the data object of the element.
    let property = this.getProperty("description") as StringProperty;
    if (!property) {
      // Create a new string property for the description of the text field element, with the name "description" and the current element as its parent.
      property = new StringProperty("description", "", this as ObjectProperty);
    }

    // Check if the description value is an observable.
    if (description instanceof Observable) {
      // Set the property in the data object of the element to the current value of the observable.
      property.value = description.getValue();

      // Add a listener to the observable description value that updates the description property whenever the value of the observable changes.
      description.subscribe((value) => {
        // Set the value of the description property to the updated value from the observable.
        this.setDescription(value);

        // Return the property related to the observable.
        // This will send a DataStoreUpdate to the related clients.
        return property;
      });
    } else {
      // Set the property in the data object of the element.
      property.value = description;
    }

    // Set the property in the data object of the element.
    this.setProperty(property);

    // Return the current instance of the TextFieldElement class to allow for method chaining.
    return this;
  }

  public triggerListeners(player: Player, data: string): void {
    // Call the superclass method to trigger all listeners
    super.triggerListeners(player, data);

    // Set the text of the text field element to the updated value from the listener trigger.
    this.setText(data);

    // Call the setValue method of the text observable to update its value and notify all subscribers of the new value, allowing them to react to the change as needed.
    this.text.setValue(data);
  }
}

export { TextFieldElement, TextFieldOptions };
