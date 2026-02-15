import { Player } from "../../../entity";
import { Observable } from "../observable";
import {
  BooleanProperty,
  LongProperty,
  ObjectProperty,
  StringProperty
} from "../properties";

import { Element } from "./element";

interface SliderElementOptions {
  /**
   * The description of the slider elemen.
   */
  description?: string | Observable<string>;

  /**
   * Whether the slider is disabled or not, which determines whether the slider is interactive and can be clicked by users.
   * A disabled slider is typically grayed out and does not respond to user interactions.
   */
  disabled?: boolean | Observable<boolean>;

  /**
   * Whether the slider is visible or hidden in the user interface.
   */
  visible?: boolean | Observable<boolean>;

  /**
   * The amount by which the slider value changes when the user interacts with it.
   */
  step?: number | Observable<number>;
}

class SliderElement extends Element<number> {
  /**
   * Create a new slider element with the given label, current value, minimum value, maximum value, options, and parent object property.
   * @param label The label to be displayed on the slider element, which is a string value that represents the text shown on the slider, allowing users to understand its purpose and function within the user interface of the custom form.
   * @param currentValue The observable that holds the current value of the slider element, which is a number that represents the current position of the slider. The value is typically displayed to users as they interact with the slider in the user interface of the custom form. The value can be updated dynamically based on user interactions with the slider, allowing for real-time feedback and updates to other elements or data in the form that may be dependent on the slider's value.
   * @param minValue The minimum value of the slider element, which is a number that represents the lower limit of the slider's range. The minimum value determines the lowest value that the slider can be set to when users interact with it in the user interface of the custom form. It is typically used in conjunction with the maximum value to define the range of values that the slider can represent, allowing users to select a specific value within that range by moving the slider handle. The minimum value can be updated dynamically based on specific conditions or user interactions, providing flexibility in how the slider behaves and interacts with other elements or data in the form.
   * @param maxValue The maximum value of the slider element, which is a number that represents the upper limit of the slider's range. The maximum value determines the highest value that the slider can be set to when users interact with it in the user interface of the custom form. It is typically used in conjunction with the minimum value to define the range of values that the slider can represent, allowing users to select a specific value within that range by moving the slider handle. The maximum value can be updated dynamically based on specific conditions or user interactions, providing flexibility in how the slider behaves and interacts with other elements or data in the form.
   * @param options The options for configuring the slider element, including the description of the slider element, whether the slider is disabled or not, whether the slider is visible or hidden in the user interface, and the amount by which the slider value changes when the user interacts with it.
   * @param parent The parent object property to which this slider element will be added, allowing it to be included in the overall configuration of the custom form.
   */
  public constructor(
    label: string | Observable<string>,
    private readonly currentValue: Observable<number>,
    minValue: number | Observable<number>,
    maxValue: number | Observable<number>,
    options: SliderElementOptions = {},
    parent: ObjectProperty | null = null
  ) {
    super("slider", parent);

    // Set the label, slider visibility, and onClick properties based on the provided options, with default values if not specified.
    this.setLabel(label)
      .setVisibility(options.visible ?? true)
      .setDisabled(options.disabled ?? false)
      .setStep(options.step ?? 1)
      .setMinValue(minValue)
      .setMaxValue(maxValue)
      .setValue(currentValue);
  }

  /**
   * Get the maximum value of the slider element, which is a number that represents the upper limit of the slider's range. The maximum value determines the highest value that the slider can be set to when users interact with it in the user interface of the custom form. It is typically used in conjunction with the minimum value to define the range of values that the slider can represent, allowing users to select a specific value within that range by moving the slider handle. The maximum value can be updated dynamically based on specific conditions or user interactions, providing flexibility in how the slider behaves and interacts with other elements or data in the form.
   * @returns The maximum value of the slider element. If the maxValue property does not exist or is not an instance of LongProperty, it returns 100 as the default value. This allows for a fallback value to ensure that the slider has a valid maximum value even if it has not been explicitly set or if there is an issue with the property configuration.
   */
  public getMaxValue(): number {
    // Get the maxValue property from the data object of the element.
    const property = this.getProperty("maxValue");

    // Check if the maxValue property exists and is an instance of LongProperty.
    if (property instanceof LongProperty) {
      // Return the value of the maxValue property as a number.
      return Number(property.value);
    }

    // If the maxValue property does not exist or is not an instance of LongProperty, return 100 as the default value.
    return 0;
  }

  /**
   * Set the maximum value of the slider element, which can be a number or an observable that emits number values.
   * @param maxValue The maximum value of the slider element, which can be a number or an observable that emits number values.
   * @returns The current instance of the SliderElement class to allow for method chaining.
   */
  public setMaxValue(maxValue: number | Observable<number>): this {
    // Create a new long property for the visible state of the element, with the name "maxValue" and the current element as its parent.
    const property = new LongProperty(
      "maxValue",
      BigInt(maxValue instanceof Observable ? maxValue.getValue() : maxValue),
      this as ObjectProperty
    );

    // Check if the maxValue value is an observable.
    if (maxValue instanceof Observable) {
      // Set the property in the data object of the element to the current value of the observable.
      property.value = BigInt(maxValue.getValue());

      // Add a listener to the observable maxValue value that updates the maxValue property whenever the value of the observable changes.
      maxValue.subscribe((value) => {
        // Set the value of the maxValue property to the updated value from the observable.
        this.setMaxValue(value);

        // Return the property related to the observable.
        // This will send a DataStoreUpdate to the related clients.
        return property;
      });
    } else {
      // Set the property in the data object of the element.
      property.value = BigInt(maxValue);
    }

    // Set the property in the data object of the element.
    this.setProperty(property);

    // Return the current instance of the Element class to allow for method chaining.
    return this;
  }

  /**
   * Get the minimum value of the slider element, which is a number that represents the lower limit of the slider's range. The minimum value determines the lowest value that the slider can be set to when users interact with it in the user interface of the custom form. It is typically used in conjunction with the maximum value to define the range of values that the slider can represent, allowing users to select a specific value within that range by moving the slider handle. The minimum value can be updated dynamically based on specific conditions or user interactions, providing flexibility in how the slider behaves and interacts with other elements or data in the form.
   * @returns The minimum value of the slider element. If the minValue property does not exist or is not an instance of LongProperty, it returns 0 as the default value. This allows for a fallback value to ensure that the slider has a valid minimum value even if it has not been explicitly set or if there is an issue with the property configuration.
   */
  public getMinValue(): number {
    // Get the minValue property from the data object of the element.
    const property = this.getProperty("minValue");

    // Check if the minValue property exists and is an instance of LongProperty.
    if (property instanceof LongProperty) {
      // Return the value of the minValue property as a number.
      return Number(property.value);
    }

    // If the minValue property does not exist or is not an instance of LongProperty, return 0 as the default value.
    return 0;
  }

  /**
   * Set the minimum value of the slider element, which can be a number or an observable that emits number values.
   * @param minValue The minimum value of the slider element, which can be a number or an observable that emits number values.
   * @returns The current instance of the SliderElement class to allow for method chaining.
   */
  public setMinValue(minValue: number | Observable<number>): this {
    // Create a new long property for the visible state of the element, with the name "minValue" and the current element as its parent.
    const property = new LongProperty(
      "minValue",
      BigInt(minValue instanceof Observable ? minValue.getValue() : minValue),
      this as ObjectProperty
    );

    // Check if the minValue value is an observable.
    if (minValue instanceof Observable) {
      // Set the property in the data object of the element to the current value of the observable.
      property.value = BigInt(minValue.getValue());

      // Add a listener to the observable minValue value that updates the minValue property whenever the value of the observable changes.
      minValue.subscribe((value) => {
        // Set the value of the minValue property to the updated value from the observable.
        this.setMinValue(value);

        // Return the property related to the observable.
        // This will send a DataStoreUpdate to the related clients.
        return property;
      });
    } else {
      // Set the property in the data object of the element.
      property.value = BigInt(minValue);
    }

    // Set the property in the data object of the element.
    this.setProperty(property);

    // Return the current instance of the Element class to allow for method chaining.
    return this;
  }

  /**
   * Get the step value of the slider element, which is a number that represents the amount by which the slider value changes when the user interacts with it. The step value determines how much the slider value increases or decreases when users click on the slider or drag it in the user interface of the custom form. For example, if the step value is 1, the slider value will increase or decrease by 1 when the user interacts with it. If the step value is 0.5, the slider value will increase or decrease by 0.5 when the user interacts with it. The step value can be updated dynamically based on specific conditions or user interactions, providing flexibility in how the slider behaves and interacts with other elements or data in the form.
   * @returns The step value of the slider element. If the step property does not exist or is not an instance of LongProperty, it returns 1 as the default value. This allows for a fallback value to ensure that the slider has a valid step value even if it has not been explicitly set or if there is an issue with the property configuration.
   */
  public getStep(): number {
    // Get the step property from the data object of the element.
    const property = this.getProperty("step");

    // Check if the step property exists and is an instance of LongProperty.
    if (property instanceof LongProperty) {
      // Return the value of the step property as a number.
      return Number(property.value);
    }

    // If the step property does not exist or is not an instance of LongProperty, return 1 as the default value.
    return 1;
  }

  /**
   * Set the step value of the slider element, which can be a number or an observable that emits number values.
   * @param step The step value of the slider element, which can be a number or an observable that emits number values. The step value determines the amount by which the slider value changes when the user interacts with it. For example, if the step value is 1, the slider value will increase or decrease by 1 when the user clicks on the slider or drags it. If the step value is 0.5, the slider value will increase or decrease by 0.5 when the user interacts with it.
   * @returns The current instance of the SliderElement class to allow for method chaining.
   */
  public setStep(step: number | Observable<number>): this {
    // Create a new long property for the visible state of the element, with the name "step" and the current element as its parent.
    const property = new LongProperty(
      "step",
      BigInt(step instanceof Observable ? step.getValue() : step),
      this as ObjectProperty
    );

    // Check if the step value is an observable.
    if (step instanceof Observable) {
      // Set the property in the data object of the element to the current value of the observable.
      property.value = BigInt(step.getValue());

      // Add a listener to the observable step value that updates the step property whenever the value of the observable changes.
      step.subscribe((value) => {
        // Set the value of the step property to the updated value from the observable.
        this.setStep(value);

        // Return the property related to the observable.
        // This will send a DataStoreUpdate to the related clients.
        return property;
      });
    } else {
      // Set the property in the data object of the element.
      property.value = BigInt(step);
    }

    // Set the property in the data object of the element.
    this.setProperty(property);

    // Return the current instance of the Element class to allow for method chaining.
    return this;
  }

  /**
   * Get the value of the slider element, which is a number that represents the current position of the slider. The value is typically displayed to users as they interact with the slider in the user interface of the custom form. The value can be updated dynamically based on user interactions with the slider, allowing for real-time feedback and updates to other elements or data in the form that may be dependent on the slider's value.
   * @returns The value of the slider element. If the value property does not exist or is not an instance of LongProperty, it returns 0 as the default value. This allows for a fallback value to ensure that the slider has a valid value even if it has not been explicitly set or if there is an issue with the property configuration.
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
   * Set the value of the slider element, which can be a number or an observable that emits number values.
   * @param value The value of the slider element, which can be a number or an observable that emits number values. The value represents the current position of the slider and is typically displayed to users as they interact with the slider in the user interface of the custom form. The value can be updated dynamically based on user interactions with the slider, allowing for real-time feedback and updates to other elements or data in the form that may be dependent on the slider's value.
   * @returns The current instance of the SliderElement class to allow for method chaining. This allows for a fluent interface where multiple methods can be called in a chain on the same instance of the SliderElement class, improving readability and ease of use when configuring the slider element in the custom form.
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
   * Get the description of the slider  element, which is a string value that represents the additional information or instructions displayed below the slider  in the user interface of the custom form.
   * @returns The description of the slider  element.
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
   * Set the description of the slider  element, which can be a string value or an observable that emits string values.
   * @param description The description of the slider  element, which can be a string value or an observable that emits string values.
   * @returns The current instance of the slider lement class to allow for method chaining.
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
      "slider_visible",
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

  public triggerListeners(player: Player, data: number): void {
    // Call the superclass method to trigger all listeners
    super.triggerListeners(player, data);

    // Set the slidder value to the updated value from the listener trigger.
    this.setValue(data);

    // Call the setValue method of the slidder observable to update its value and notify all subscribers of the new value, allowing them to react to the change as needed.
    this.currentValue.setValue(data);
  }
}

export { SliderElement, SliderElementOptions };
