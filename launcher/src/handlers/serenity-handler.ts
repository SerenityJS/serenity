import { NetworkHandler } from "@serenityjs/network";

import { Serenity } from "../serenity";

/**
 * Represents a Serenity handler.
 */
abstract class SerenityHandler extends NetworkHandler {
	/**
	 * The Serenity instance.
	 */
	public static serenity: Serenity;
}

export { SerenityHandler };
