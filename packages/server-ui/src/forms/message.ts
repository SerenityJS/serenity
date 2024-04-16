import { ModalFormType } from "@serenityjs/protocol";

import { Form } from "./form";

/**
 * Represents a server sided ui message form that can be shown to a player.
 * This form is used to display a message to the player with two buttons.
 */
class MessageForm extends Form<boolean> {
	public readonly type = ModalFormType.Message;

	/**
	 * The title of the form.
	 */
	public title!: string;

	/**
	 * The content of the form.
	 */
	public content!: string;

	/**
	 * The text of the first button.
	 */
	public button1!: string;

	/**
	 * The text of the second button.
	 */
	public button2!: string;
}

export { MessageForm };
