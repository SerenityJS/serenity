import { FormType, ModalFormRequest } from '@serenityjs/bedrock-protocol';
import type { Player } from '../player';
import type { MessageFormResponse, MessageFormJson } from '../types';
import { Form } from './Form';

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
	public title: string;
	/**
	 * The content of the form.
	 */
	public content: string;
	/**
	 * The first button of the form.
	 */
	public button1: string;
	/**
	 * The second button of the form.
	 */
	public button2: string;

	/**
	 * Constructs a new MessageForm.
	 *
	 * @param title The title of the form.
	 * @param content The content of the form.
	 * @param button1 The first button of the form.
	 * @param button2 The second button of the form.
	 */
	public constructor(title: string, content: string, button1: string, button2: string) {
		super();
		this.title = title;
		this.content = content;
		this.button1 = button1;
		this.button2 = button2;
	}

	/**
	 * Converts the form to a json object.
	 *
	 * @returns The json object.
	 */
	public toJson(): MessageFormJson {
		// Return the json object.
		return {
			button1: this.button1,
			button2: this.button2,
			content: this.content,
			title: this.title,
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

	public async show(player: Player): Promise<MessageFormResponse> {
		return new Promise((resolve, reject) => {
			// Add the form to the player's forms.
			player.forms.set(this.id, { resolve, reject });

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
