import type { Packet } from "@serenityjs/protocol";
import type { Serenity } from "../serenity";

/**
 * Represents an abstract event signal.
 */
class EventSignal {
	/**
	 * The serenity instance.
	 */
	public static serenity: Serenity;

	/**
	 * The packet of the event signal.
	 */
	public static readonly hook: Packet;

	/**
	 * The logic of the event signal.
	 * @param arguments - The arguments of the event signal.
	 */
	public static logic(..._arguments: Array<unknown>): void {
		this.serenity.logger.error(
			"EventSignal.logic() method is not implemented."
		);
	}
}

export { EventSignal };
