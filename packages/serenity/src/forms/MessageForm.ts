import { FormType, ModalFormRequest } from '@serenityjs/bedrock-protocol';
import type { Player } from '../player/index.js';
import type { MessageFormResponse, MessageFormJson } from '../types/index.js';
import { Form } from './Form.js';

/**
 * Represents a generic message form.
 */
class MessageForm extends Form {
	/**
	 * The type of form.
	 */
	public static readonly TYPE = FormType.Message;

	/**
	 * The title of the form.
	 */
	protected _title: string = '';

	/**
	 * The content of the form.
	 */
	protected _content: string = '';

	/**
	 * The first button of the form.
	 */
	protected _button1: string = '';

	/**
	 * The second button of the form.
	 */
	protected _button2: string = '';

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
	 * Sets the first button of the form.
	 *
	 * @param button - The first button of the form.
	 * @returns The message form.
	 */
	public button1(button: string): this {
		this._button1 = button;
		return this;
	}

	/**
	 * Sets the second button of the form.
	 *
	 * @param button - The second button of the form.
	 * @returns The message form.
	 */
	public button2(button: string): this {
		this._button2 = button;
		return this;
	}

	/**
	 * Converts the form to a json object.
	 *
	 * @returns The json object.
	 */
	public toJson(): MessageFormJson {
		// Return the json object.
		return {
			button1: this._button1,
			button2: this._button2,
			content: this._content,
			title: this._title,
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
	public async show(player: Player): Promise<MessageFormResponse> {
		return new Promise((resolve, reject) => {
			// Add the form to the player's forms.
			player.forms.set(this.id, { resolve: resolve as any, reject, type: MessageForm.TYPE });

			// Create the form.
			const form = new ModalFormRequest();
			form.id = this.id;
			form.payload = JSON.stringify({ type: MessageForm.TYPE, ...this.toJson() });

			// Send the form to the player.
			void player.session.send(form);
		});
	}
}

export { MessageForm };
