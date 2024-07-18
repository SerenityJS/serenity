import { DialogueButton } from "./button";

class DialogueScene {
	/**
	 * The name of the scene.
	 */
	public readonly name: string;

	/**
	 * The dialogue text content of the scene.
	 */
	public readonly dialogue: string;

	/**
	 * The buttons of the scene.
	 */
	public readonly buttons: Set<DialogueButton>;

	/**
	 * Creates a new dialogue scene.
	 *
	 * @param name The name of the scene.
	 * @param dialogue The dialogue of the scene.
	 * @param buttons The buttons of the scene.
	 * @returns A new dialogue scene.
	 */
	public constructor(
		name: string,
		dialogue: string,
		buttons?: Set<DialogueButton>
	) {
		this.name = name;
		this.dialogue = dialogue;
		this.buttons = buttons ?? new Set();
	}

	/**
	 * Create a new button for the scene.
	 * @param text The text of the button.
	 * @param commands The commands to execute when the button is clicked.
	 * @returns The dialogue scene.
	 */
	public createButton(text: string, commands?: Array<string>): this {
		// Create a new button
		const button = new DialogueButton(text, new Set(commands));

		// Add the button to the scene
		this.buttons.add(button);

		// Return the scene
		return this;
	}

	/**
	 * Get the button by text.
	 * @param text The text of the button.
	 * @returns The button if found, otherwise undefined.
	 */
	public getButton(text: string): DialogueButton | undefined {
		return [...this.buttons].find((button) => button.text === text);
	}

	/**
	 * Add a button to the scene.
	 * @param button The button to add.
	 * @returns The dialogue scene.
	 */
	public addButton(button: DialogueButton): this {
		// Add the button to the scene
		this.buttons.add(button);

		// Return the scene
		return this;
	}

	/**
	 * Remove a button from the scene.
	 * @param text The text of the button to remove.
	 */
	public removeButton(text: string): void {
		// Get the button by text
		const button = this.getButton(text);

		// If the button exists, remove it
		if (button) this.buttons.delete(button);
	}
}

export { DialogueScene };
