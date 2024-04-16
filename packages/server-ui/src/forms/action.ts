import { ModalFormType } from "@serenityjs/protocol";

import { Form } from "./form";

/**
 * Represents an image that can be shown on an action form button.
 */
interface ActionFormImage {
	data: string;
	type: "path" | "url";
}

/**
 * Represents a button that can be shown on an action form.
 */
interface ActionFormButton {
	text: string;
	image?: ActionFormImage;
}

/**
 * Represents a server sided ui action form that can be shown to a player.
 */
class ActionForm extends Form<number> {
	public readonly type = ModalFormType.Action;

	/**
	 * The title of the form.
	 */
	public title!: string;

	/**
	 * The content of the form.
	 */
	public content!: string;

	/**
	 * The buttons of the form.
	 */
	public readonly buttons: Array<ActionFormButton> = [];

	/**
	 * Adds a button to the form.
	 */
	public button(text: string, image?: ActionFormImage): this {
		// Push the button to the buttons array
		this.buttons.push({ text, image });

		// Return this instance
		return this;
	}
}

export { ActionForm, ActionFormButton, ActionFormImage };
