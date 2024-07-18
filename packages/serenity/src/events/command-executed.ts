import {
	DisconnectReason,
	Packet,
	type CommandRequestPacket
} from "@serenityjs/protocol";
import { NetworkBound, type NetworkPacketEvent } from "@serenityjs/network";

import { EventSignal } from "./event-signal";
import { EventPriority } from "./priority";

import type { Serenity } from "../serenity";
import type { Player } from "@serenityjs/world";

class CommandExecutedSignal extends EventSignal {
	/**
	 * The serenity instance.
	 */
	public static serenity: Serenity;

	/**
	 * The packet of the event signal.
	 */
	public static readonly hook = Packet.CommandRequest;

	/**
	 * The priority of the event signal.
	 */
	public static readonly priority = EventPriority.Before;

	/**
	 * The player that chated in the world.
	 */
	public readonly player: Player;

	/**
	 * The command of the chat.
	 */
	public command: string;

	/**
	 * Constructs a new player chat signal instance.
	 * @param player The player that chated in the world.
	 * @param command The command of the chat.
	 */
	public constructor(player: Player, command: string) {
		super();
		this.player = player;
		this.command = command;
	}

	public static logic(data: NetworkPacketEvent<CommandRequestPacket>): boolean {
		// Separate the data into variables.
		const { session, bound, packet } = data;

		// Also check if the packet is outgoing. Meaning the packet is being sent to the client.
		if (bound !== NetworkBound.Server) return true;

		// Get the player from the session.
		// If there is no player, then disconnect the session.
		const player = this.serenity.getPlayer(session);
		if (!player) {
			session.disconnect(
				"Failed to connect due to an invalid player. Please try again.",
				DisconnectReason.InvalidPlayer
			);

			return false;
		}

		// Create a new player chat signal instance.
		const signal = new CommandExecutedSignal(player, packet.command);

		// Emit the CommandExecuted event.
		const value = this.serenity.emit("CommandExecuted", signal);

		// Assign the new value of the command.
		packet.command = signal.command;

		// Return the value of the event.
		return value;
	}
}

export { CommandExecutedSignal };
