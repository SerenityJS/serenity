import type { FormType } from '@serenityjs/bedrock-protocol';

/**
 * Represents a generic modal form.
 */
abstract class Form {
	/**
	 * The type of form.
	 */
	public static readonly TYPE: FormType;

	/**
	 * The payload of the form.
	 */
	public abstract toPayload(): string;
}

export { Form };
