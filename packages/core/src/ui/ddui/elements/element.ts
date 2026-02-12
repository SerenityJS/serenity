import { Observable } from "../observable";
import { BooleanProperty, ObjectProperty, StringProperty } from "../properties";

class Element<T> extends ObjectProperty<T> {
  /**
   * Create a new element with the given name and parent property.
   * @param name The name of the element, used for identification and referencing purposes.
   * @param parent The parent property of the current element.
   */
  public constructor(name: string, parent: ObjectProperty | null = null) {
    // Call the constructor of the parent class (ObjectProperty) to initialize the element with the given name and parent property.
    super(name, parent);
  }

  /**
   * Get the label of the element.
   * @returns The label of the element, which is a string value that represents the text shown on the element, allowing users to understand its purpose and function within the user interface.
   */
  public getLabel(): string {
    // Get the label property from the data object of the element.
    const property = this.getProperty("label");

    // Check if the label property exists and is an instance of StringProperty.
    if (property instanceof StringProperty) {
      // Return the value of the label property.
      return property.value;
    }

    // If the label property does not exist or is not an instance of StringProperty, return an empty string as the default value.
    return "";
  }

  /**
   * Get the label of the element.
   * @param label The label of the element, which is a string value that represents the text shown on the element.
   * @returns The current instance of the Element class to allow for method chaining.
   */
  public setLabel(label: string | Observable<string>): this {
    // Create a new string property for the label of the element, with the name "label" and the current element as its parent.
    const property = new StringProperty("label", "", this as ObjectProperty);

    // Check if the label value is an observable.
    if (label instanceof Observable) {
      // Set the property in the data object of the element to the current value of the observable.
      property.value = label.getValue();

      // Add a listener to the observable label value that updates the label property whenever the value of the observable changes.
      label.subscribe((value) => {
        // Set the value of the label property to the updated value from the observable.
        this.setLabel(value);

        // Return the property related to the observable.
        // This will send a DataStoreUpdate to the related clients.
        return property;
      });
    } else {
      // Set the property in the data object of the element.
      property.value = label;
    }

    // Set the property in the data object of the element.
    this.setProperty(property);

    // Return the current instance of the Element class to allow for method chaining.
    return this;
  }

  /**
   * Get the disabled state of the element.
   * @returns The disabled state of the element, which is a boolean value indicating whether the element is disabled or not.
   */
  public getDisabled(): boolean {
    // Get the disabled property from the data object of the element.
    const property = this.getProperty("disabled");

    // Check if the disabled property exists and is an instance of BooleanProperty.
    if (property instanceof BooleanProperty) {
      // Return the value of the disabled property.
      return property.value;
    }

    // If the disabled property does not exist or is not an instance of BooleanProperty, return false as the default value.
    return false;
  }

  /**
   * Set the disabled state of the element, which can be a boolean value or an observable that emits boolean values.
   * @param disabled The disabled state of the element, which can be a boolean value or an observable that emits boolean values.
   * @returns The current instance of the Element class to allow for method chaining.
   */
  public setDisabled(disabled: boolean | Observable<boolean>): this {
    // Create a new boolean property for the disabled state of the element, with the name "disabled" and the current element as its parent.
    const property = new BooleanProperty(
      "disabled",
      false,
      this as ObjectProperty
    );

    // Check if the disabled value is an observable.
    if (disabled instanceof Observable) {
      // Set the property in the data object of the element to the current value of the observable.
      property.value = disabled.getValue();

      // Add a listener to the observable disabled value that updates the disabled property whenever the value of the observable changes.
      disabled.subscribe((value) => {
        // Set the value of the disabled property to the updated value from the observable.
        this.setDisabled(value);

        // Return the property related to the observable.
        // This will send a DataStoreUpdate to the related clients.
        return property;
      });
    } else {
      // Set the property in the data object of the element.
      property.value = disabled;
    }

    // Set the property in the data object of the element.
    this.setProperty(property);

    // Return the current instance of the Element class to allow for method chaining.
    return this;
  }

  /**
   * Get the visibility of the element.
   * @returns The visibility of the element, which is a boolean value indicating whether the element is visible or hidden in the user interface.
   */
  public getVisibility(): boolean {
    // Get the visible property from the data object of the element.
    const property = this.getProperty("visible");

    // Check if the visible property exists and is an instance of BooleanProperty.
    if (property instanceof BooleanProperty) {
      // Return the value of the visible property.
      return property.value;
    }

    // If the visible property does not exist or is not an instance of BooleanProperty, return true as the default value.
    return true;
  }

  /**
   * Set the visibility of the element, which can be a boolean value or an observable that emits boolean values.
   * @param visible The visibility of the element, which can be a boolean value or an observable that emits boolean values.
   * @returns The current instance of the Element class to allow for method chaining.
   */
  public setVisibility(visible: boolean | Observable<boolean>): this {
    // Create a new boolean property for the visible state of the element, with the name "visible" and the current element as its parent.
    const property = new BooleanProperty(
      "visible",
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

export { Element };
