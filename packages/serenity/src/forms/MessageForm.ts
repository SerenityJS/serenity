import { FormType } from '@serenityjs/bedrock-protocol';
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
	 * Converts the form to a payload.
	 *
	 * @returns The payload.
	 */
	public toPayload(): string {
		// Create a payload object.
		const payload = {
			type: FormType.Message,
			title: this.title,
			content: this.content,
			button1: this.button1,
			button2: this.button2,
		};

		// Return the payload as a JSON string.
		return JSON.stringify(payload);
	}
}

export { MessageForm };
