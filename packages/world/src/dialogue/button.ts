class DialogueButton {
	/**
	 * The text of the button.
	 */
	public readonly text: string;

	/**
	 * The commands to execute when the button is clicked.
	 */
	public readonly commands: Set<string>;

	/**
	 * Creates a new dialogue button.
	 *
	 * @param text The text of the button.
	 * @param commands The commands to execute when the button is clicked.
	 * @returns A new dialogue button.
	 */
	public constructor(text: string, commands?: Set<string>) {
		this.text = text;
		this.commands = commands ?? new Set();
	}
}

export { DialogueButton };
