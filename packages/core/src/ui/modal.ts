import { ModalFormType } from "@serenityjs/protocol";

import { Form } from "./form";

/**
 * These forms are the must advanced type of form. These allow developers to add elements to request input from the player, rather than using buttons. The elements used in ModalForms are: dropdown, input, label, slider, stepSlider, and toggle.
 *
 * **Example Usage**
	```ts
	import { ModalForm } from "@serenityjs/server-ui"
	
	// Create a new ModalForm instance and set the title and add elements
	const form = new ModalForm()
	form.title = "ModalForm Example"
	
	// A dropdown allows the player to select from a list of options
	form.dropdown("Dropdown Element", ["Option 1", "Option 2", "Option 3"], 1)
	
	// An input allows the player to enter text
	form.input("Input Element", "Input Placeholder", "Input Text")
	
	// A slider allows the player to select a value within a range
	form.slider("Slider Element", 0, 100, 10)
	
	// A step slider allows the player to select a value from a list of options
	form.stepSlider("Step Slider Element", ["Step 1", "Step 2", "Step 3"], 1)
	
	// A toggle allows the player to enable or disable an option
	form.toggle("Toggle Element", true)
	
	// A label displays text to the player
	form.label("Label Element", "Label Text")
	
	// Show the form to the player
	form.show(player)
	  .then((response) => {})
	  .catch((rejected) => {})
	```
 */
class ModalForm<T = Array<unknown>> extends Form<T> {
  public readonly type = ModalFormType.Modal;

  /**
   * The title of the form.
   */
  public title!: string;

  /**
   * The content of the form.
   */
  public readonly content: Array<unknown> = [];

  /**
   * Adds a dropdown menu to the form.
   * @param text The text of the dropdown menu
   * @param options The options of the dropdown menu
   * @param defaultIndex The default index of the dropdown menu
   * @returns
   */
  public dropdown(
    text: string,
    options: Array<string>,
    defaultIndex = 0
  ): this {
    this.content.push({
      type: "dropdown",
      text,
      options,
      default: defaultIndex
    });

    return this;
  }

  /**
   * Adds a text input to the form.
   * @param text The text of the input
   * @param placeholder The placeholder of the input
   * @returns
   */
  public input(text: string, placeholder = "", defaultText = String()): this {
    this.content.push({
      type: "input",
      text,
      placeholder,
      default: defaultText
    });

    return this;
  }

  /**
   * Adds a label to the form.
   * @param text The text of the label
   * @returns
   */
  public label(text: string): this {
    this.content.push({ type: "label", text });

    return this;
  }

  /**
   * Adds a slider to the form.
   * @param text The text of the slider
   * @param min The minimum value of the slider
   * @param max The maximum value of the slider
   * @param step The step of the slider
   * @param defaultValue The default value of the slider
   * @returns
   */
  public slider(
    text: string,
    min: number,
    max: number,
    step = 1,
    defaultValue = min
  ): this {
    this.content.push({
      type: "slider",
      text,
      min,
      max,
      step,
      default: defaultValue
    });

    return this;
  }

  /**
   * Adds a step slider to the form.
   * @param text The text of the step slider
   * @param steps The steps of the step slider
   * @param defaultIndex The default index of the step slider
   * @returns
   */
  public stepSlider(
    text: string,
    steps: Array<string>,
    defaultIndex = 0
  ): this {
    this.content.push({
      type: "step_slider",
      text,
      steps,
      default: defaultIndex
    });

    return this;
  }

  /**
   * Adds a toggle switch to the form.
   * @param text The text of the toggle
   * @param defaultValue The default value of the toggle
   * @returns
   */
  public toggle(text: string, defaultValue = false): this {
    this.content.push({ type: "toggle", text, default: defaultValue });

    return this;
  }
}

export { ModalForm };
