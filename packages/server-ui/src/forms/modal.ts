import { ModalFormType } from "@serenityjs/protocol";

import { Form } from "./form";

/**
 * Represents a server sided ui modal form that can be shown to a player.
 * This form is used to display a modal to the player with multiple inputs.
 */
class ModalForm<T = unknown> extends Form<Array<T>> {
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
	public input(text: string, placeholder = ""): this {
		this.content.push({ type: "input", text, placeholder });

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
