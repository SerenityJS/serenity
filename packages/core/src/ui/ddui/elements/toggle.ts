import { Player } from "../../../entity";
import { Observable } from "../observable";
import { BooleanProperty, ObjectProperty, StringProperty } from "../properties";

import { Element } from "./element";

interface ToggleElementOptions {
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

class ToggleElement extends Element<boolean> {
  /**
   * Create a new toggle element with the given label, toggled state, options, and parent object property.
   * @param label The label to be displayed on the toggle element, which is a string value that represents the text shown on the toggle, allowing users to understand its purpose and function within the user interface.
   * @param toggled The toggled state of the toggle element, which can be a boolean value or an observable that emits boolean values, representing whether the toggle is currently in the on or off state.
   * @param options The options for configuring the toggle element, including the description of the toggle element, whether the toggle is disabled or not, and whether the toggle is visible or hidden in the user interface.
   * @param parent The parent object property to which this toggle element will be added, allowing it to be included in the overall configuration of the custom form.
   */
  public constructor(
    label: string | Observable<string>,
    private readonly toggled: Observable<boolean>,
    options: ToggleElementOptions = {},
    parent: ObjectProperty | null = null
  ) {
    super("toggle", parent);

    // Set the label, disabled state, visibility, description, and toggled state of the toggle element based on the provided options, with default values if not specified.
    this.setLabel(label)
      .setDisabled(options.disabled ?? false)
      .setVisibility(options.visible ?? true)
      .setDescription(options.description ?? "")
      .setToggled(toggled);
  }

  /**
   * Get the toggled state of the toggle element, which is a boolean value that represents whether the toggle is currently in the on or off state.
   * @returns The toggled state of the toggle element, which is a boolean value that represents whether the toggle is currently in the on or off state. If the toggled property does not exist or is not an instance of BooleanProperty, it returns false as the default value.
   */
  public getToggled(): boolean {
    // Check if the toggled property exists in the data object of the element and is an instance of BooleanProperty.
    const property = this.getProperty("toggled");
    if (property instanceof BooleanProperty) {
      // Return the value of the toggled property.
      return property.value;
    }

    // If the toggled property does not exist or is not an instance of BooleanProperty, return false as the default value.
    return false;
  }

  /**
   * Set the toggled state of the toggle element, which can be a boolean value or an observable that emits boolean values.
   * @param toggled The toggled state of the toggle element, which can be a boolean value or an observable that emits boolean values.
   * @returns The current instance of the ToggleElement class to allow for method chaining.
   */
  public setToggled(toggled: boolean | Observable<boolean>): this {
    // Fetch the existing toggled property from the data object of the element.
    let property = this.getProperty("toggled") as BooleanProperty;
    if (!property) {
      // Create a new string property for the toggled of the toggled element, with the name "toggled" and the current element as its parent.
      property = new BooleanProperty("toggled", false, this as ObjectProperty);

      // Add a listener
      property.addListener(this.triggerListeners.bind(this));
    }

    // Check if the toggled value is an observable.
    if (toggled instanceof Observable) {
      // Set the property in the data object of the element to the current value of the observable.
      property.value = toggled.getValue();

      // Add a listener to the observable toggled value that updates the toggled property whenever the value of the observable changes.
      toggled.subscribe((value) => {
        // Set the value of the toggled property to the updated value from the observable.
        this.setToggled(value);

        // Return the property related to the observable.
        // This will send a DataStoreUpdate to the related clients.
        return property;
      });
    } else {
      // Set the property in the data object of the element.
      property.value = toggled;
    }

    // Set the property in the data object of the element.
    this.setProperty(property);

    // Return the current instance of the ToggleFieldElement class to allow for method chaining.
    return this;
  }

  /**
   * Get the description of the toggle element, which is a string value that represents the additional information or instructions displayed below the toggle in the user interface of the custom form.
   * @returns The description of the toggle element.
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
   * Set the description of the toggle element, which can be a string value or an observable that emits string values.
   * @param description The description of the toggle element, which can be a string value or an observable that emits string values.
   * @returns The current instance of the Togglelement class to allow for method chaining.
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
      "toggle_visible",
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

  public triggerListeners(player: Player, data: boolean): void {
    // Call the superclass method to trigger all listeners
    super.triggerListeners(player, data);

    // Set the toggle of the toggle field element to the updated value from the listener trigger.
    this.setToggled(data);

    // Call the setValue method of the toggle observable to update its value and notify all subscribers of the new value, allowing them to react to the change as needed.
    this.toggled.setValue(data);
  }
}

export { ToggleElement, ToggleElementOptions };
