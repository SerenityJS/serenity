import { FormType, ModalFormRequest } from '@serenityjs/bedrock-protocol';
import type { Player } from '../player/index.js';
import type { ActionFormResponse, ActionFormJson, ActionFormButton, ActionFormImage } from '../types/index.js';
import { Form } from './Form.js';

/**
 * Represents a generic message form.
 */
class ActionForm extends Form {
	/**
	 * The type of form.
	 */
	public static readonly TYPE = FormType.Action;

	/**
	 * The title of the form.
	 */
	protected _title: string = '';

	/**
	 * The content of the form.
	 */
	protected _content: string = '';

	/**
	 * The buttons of the form.
	 */
	protected _buttons: ActionFormButton[] = [];

	/**
	 * Sets the title of the form.
	 *
	 * @param title - The title of the form.
	 * @returns The message form.
	 */
	public title(title: string): this {
		this._title = title;
		return this;
	}

	/**
	 * Sets the content of the form.
	 *
	 * @param content - The content of the form.
	 * @returns The message form.
	 */
	public content(content: string): this {
		this._content = content;
		return this;
	}

	/**
	 * Adds a button to the form.
	 *
	 * @param text - The text of the button.
	 * @param image - The image of the button.
	 * @returns The message form.
	 */
	public button(text: string, image?: ActionFormImage): this {
		this._buttons.push({ text, image });
		return this;
	}

	/**
	 * Converts the form to a json object.
	 *
	 * @returns The json object.
	 */
	public toJson(): ActionFormJson {
		// Return the json object.
		return {
			title: this._title,
			content: this._content,
			buttons: this._buttons,
		};
	}

	/**
	 * Converts the form to a stringified json.
	 *
	 * @returns The stringified json.
	 */
	public toString(): string {
		// Return the stringified json.
		return JSON.stringify(this.toJson());
	}

	/**
	 * Shows the form to the player.
	 *
	 * @param player - The player to show the form to.
	 * @returns The response of the form.
	 */
	public async show(player: Player): Promise<ActionFormResponse> {
		return new Promise((resolve, reject) => {
			// Add the form to the player's forms.
			player.forms.set(this.id, { resolve: resolve as any, reject, type: ActionForm.TYPE });

			// Create the form.
			const form = new ModalFormRequest();
			form.id = this.id;
			form.payload = JSON.stringify({ type: ActionForm.TYPE, ...this.toJson() });

			// Send the form to the player.
			player.session.send(form);
		});
	}
}

export { ActionForm };
