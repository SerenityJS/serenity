import { Player } from "../../entity";

import {
  ButtonElement,
  ButtonOptions,
  CloseButtonElement,
  CloseButtonOptions,
  SliderElement,
  SliderElementOptions,
  TextFieldElement,
  TextFieldOptions,
  ToggleElement,
  ToggleElementOptions
} from "./elements";
import { Observable } from "./observable";
import { ObjectProperty, StringProperty } from "./properties";
import { DataDrivenScreen } from "./screen";

class CustomForm extends DataDrivenScreen {
  public readonly identifier = "minecraft:custom_form";

  public readonly property = "custom_form_data";

  public constructor(title?: string | Observable<string>) {
    super();

    // If a title is provided, set the title of the form using the title method.
    if (title) this.title(title);
  }

  /**
   * Set the title of the custom form to be displayed to users when the form is shown in the user interface.
   * @param title The title of the custom form, which is a string value that represents the text shown at the top of the form.
   * @returns The current instance of the CustomForm class.
   */
  public title(title: string | Observable<string>): this {
    // Check if the title is an instance of Observable, which allows for dynamic updates to the title value based on changes in the observable data.
    if (title instanceof Observable) {
      // Create a new string property with the given name and value.
      const property = new StringProperty(
        "title",
        title.getValue(),
        this as ObjectProperty
      );

      // Add a listener to the observable title that updates the title property whenever the value of the observable changes.
      title.subscribe((value) => {
        // Set the value of the title property to the updated value from the observable.
        this.title(value);

        // Return the property related to the observable.
        return property;
      });

      // Set the property in the data object of the custom form.
      this.setProperty(property);
    } else {
      // Create a new string property with the given name and value.
      const property = new StringProperty(
        "title",
        title,
        this as ObjectProperty
      );

      // Set the property in the data object of the custom form.
      this.setProperty(property);
    }

    // Return the current instance of the CustomForm class to allow for method chaining.
    return this;
  }

  /**
   * Add a close button to the custom form with the given options.
   * @param options The options for configuring the close button, including the label to be displayed on the button and whether the button is visible or hidden in the user interface.
   * @returns The current instance of the CustomForm class.
   */
  public closeButton(options: CloseButtonOptions = {}): this {
    // Create a new close button element using the CustomForm as the parent object property, which will add the close button configuration to the overall data of the form.
    const button = new CloseButtonElement(options, this);

    // Add a listener to the close button element that closes the form when clicked.
    button.addListener((player) => this.close(player));

    // Add the close button element to the layout of the custom form, which will include it in the overall structure and arrangement of the form elements when the form is displayed.
    this.setProperty(button as ObjectProperty);

    // Return the current instance of the CustomForm class to allow for method chaining.
    return this;
  }

  /**
   * Add a button to the custom form with the given label, listener, and options.
   * @param label The label to be displayed on the button, which is a string value that represents the text shown on the button, allowing users to understand its purpose and function within the user interface.
   * @param listener The listener function to be added to the button, which defines the behavior and response of the button when it is interacted with by users, enabling dynamic and interactive user interfaces.
   * @param options The options for configuring the button, including the label to be displayed on the button and whether the button is visible or hidden in the user interface.
   * @returns The current instance of the CustomForm class.
   */
  public button(
    label: string | Observable<string>,
    listener: (player: Player) => void,
    options: ButtonOptions = {}
  ): this {
    // Create a new button element using the CustomForm as the parent object property.
    const button = new ButtonElement(label, options, this.layout);

    // Add the provided listener function to the button element, allowing it to be triggered when the button is interacted with in the user interface.
    button.addListener(listener);

    // Add the button element to the layout of the custom form, which will include it in the overall structure and arrangement of the form elements when the form is displayed.
    this.layout.setProperty(button as ObjectProperty);

    // Return the current instance of the CustomForm class to allow for method chaining.
    return this;
  }

  /**
   * Add a text field to the custom form with the given label, text observable, and options.
   * @param label The label to be displayed on the text field.
   * @param text The observable that holds the value of the text field.
   * @param options The options for configuring the text field.
   * @returns The current instance of the CustomForm class to allow for method chaining.
   */
  public textField(
    label: string | Observable<string>,
    text: Observable<string>,
    options: TextFieldOptions = {}
  ): this {
    // Create a new text field element using the CustomForm as the parent object property.
    const textField = new TextFieldElement(label, text, options, this.layout);

    // Add the text field element to the layout of the custom form, which will include it in the overall structure and arrangement of the form elements when the form is displayed.
    this.layout.setProperty(textField as ObjectProperty);

    // Return the current instance of the CustomForm class to allow for method chaining.
    return this;
  }

  /**
   * Add a toggle element to the custom form with the given label, toggled state, and options.
   * @param label The label to be displayed on the toggle element.
   * @param toggled The observable that holds the toggled state of the toggle element.
   * @param options The options for configuring the toggle element.
   * @returns The current instance of the CustomForm class to allow for method chaining.
   */
  public toggle(
    label: string | Observable<string>,
    toggled: Observable<boolean>,
    options: ToggleElementOptions = {}
  ): this {
    // Create a new toggle element using the CustomForm as the parent object property.
    const toggle = new ToggleElement(label, toggled, options, this.layout);

    // Add the toggle element to the layout of the custom form, which will include it in the overall structure and arrangement of the form elements when the form is displayed.
    this.layout.setProperty(toggle as ObjectProperty);

    // Return the current instance of the CustomForm class to allow for method chaining.
    return this;
  }

  /**
   * Add a slider element to the custom form with the given label, value observable, minimum value, maximum value, and options.
   * @param label The label to be displayed on the slider element, which is a string value that represents the text shown on the slider, allowing users to understand its purpose and function within the user interface of the custom form.
   * @param value The observable that holds the value of the slider element, which is a number that represents the current position of the slider within its defined range. The value can be updated dynamically based on user interactions with the slider, allowing for real-time feedback and adjustments to other elements or data in the form based on the selected slider value. The observable nature of the value allows for seamless integration with other reactive components in the form, enabling dynamic and interactive user interfaces.
   * @param minValue The minimum value of the slider element, which is a number that represents the lower limit of the slider's range. The minimum value determines the lowest value that the slider can be set to when users interact with it in the user interface of the custom form. It is typically used in conjunction with the maximum value to define the range of values that the slider can represent, allowing users to select a specific value within that range by moving the slider handle. The minimum value can be updated dynamically based on specific conditions or user interactions, providing flexibility in how the slider behaves and interacts with other elements or data in the form.
   * @param maxValue The maximum value of the slider element, which is a number that represents the upper limit of the slider's range. The maximum value determines the highest value that the slider can be set to when users interact with it in the user interface of the custom form. It is typically used in conjunction with the minimum value to define the range of values that the slider can represent, allowing users to select a specific value within that range by moving the slider handle. The maximum value can be updated dynamically based on specific conditions or user interactions, providing flexibility in how the slider behaves and interacts with other elements or data in the form.
   * @param options The options for configuring the slider element, including the description of the slider element, whether the slider is disabled or not, whether the slider is visible or hidden in the user interface, and the amount by which the slider value changes when the user interacts with it.
   * @returns The current instance of the CustomForm class to allow for method chaining.
   */
  public slider(
    label: string | Observable<string>,
    value: Observable<number>,
    minValue: number,
    maxValue: number,
    options: SliderElementOptions = {}
  ): this {
    // Create a new slider element using the CustomForm as the parent object property.
    const slider = new SliderElement(
      label,
      value,
      minValue,
      maxValue,
      options,
      this.layout
    );

    // Add the slider element to the layout of the custom form, which will include it in the overall structure and arrangement of the form elements when the form is displayed.
    this.layout.setProperty(slider as ObjectProperty);

    // Return the current instance of the CustomForm class to allow for method chaining.
    return this;
  }
}

export { CustomForm };
