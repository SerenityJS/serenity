import type { FormType } from '@serenityjs/bedrock-protocol';
import type { Player } from '../player';

let FORM_ID = 0;

/**
 * Represents a generic modal form.
 */
abstract class Form {
	/**
	 * The type of form.
	 */
	public static readonly TYPE: FormType;

	/**
	 * The unique id of the form.
	 */
	public readonly id = FORM_ID++;

	/**
	 * Converts the form to a json object.
	 *
	 * @returns The json object.
	 */
	public abstract toJson(): object;

	/**
	 * The stringified json of the form.
	 */
	public abstract toString(): string;

	public abstract show(player: Player): Promise<object>;
}

export { Form };
