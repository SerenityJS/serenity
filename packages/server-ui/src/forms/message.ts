import { ModalFormType } from "@serenityjs/protocol";

import { Form } from "./form";

/**
 * These forms add a simple popup with a brief context with only 2 selection button, these are usally used for a Yes or No question.
 *
 * **Example Usage**
	```ts
	import { MessageForm } from "@serenityjs/server-ui"

	// Create a new MessageForm instance and set the title, content, and button text
	const form = new MessageForm()
	form.title = "MessageForm Example"
	form.content = "This is a test message form. This is the description of the message form."
	form.button1 = "Button 1"
	form.button2 = "Button 2"

	// Show the form to the player
	form.show(player)
  	.then((response) => {})
  	.catch((rejected) => {})
	```
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
