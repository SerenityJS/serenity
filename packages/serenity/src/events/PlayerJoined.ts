import type { PlayStatus } from '@serenityjs/bedrock-protocol';
import { DisconnectReason, Packet, PlayerStatus } from '@serenityjs/bedrock-protocol';
import type { Serenity } from '../Serenity.js';
import { NetworkBound, type NetworkPacketEvent } from '../network/index.js';
import type { Player } from '../player/index.js';
import { HookMethod } from '../types/index.js';
import { AbstractEvent } from './AbstractEvent.js';

class PlayerJoined extends AbstractEvent {
	public static serenity: Serenity;
	public static readonly hook = Packet.PlayStatus;
	public static readonly method = HookMethod.After;

	public readonly player: Player;

	public constructor(player: Player) {
		super();
		this.player = player;
	}

	public static async logic(data: NetworkPacketEvent<PlayStatus>): Promise<void> {
		// Separate the data into variables.
		const { session, bound, packet } = data;

		// Check if the player's status is login success.
		// Also check if the packet is outgoing. Meaning the packet is being sent to the client.
		if (packet.status !== PlayerStatus.LoginSuccess || bound !== NetworkBound.Client) return;

		// First we need to check if their is a player instance.
		if (!session.player) {
			return this.serenity.logger.error(
				`Failed to find player instance for ${session.identifier.address}:${session.identifier.port}! PlayerJoined.logic()`,
			);
		}

		// Declare the player.
		const player = session.player;

		// Emit the new player event.
		// Await the event to ensure that no data was changed.
		const value = await this.serenity.emit('PlayerJoined', new this(player));

		// If the value is false, the event was cancelled.
		// In this case, we will disconnect the player.
		if (!value) {
			return session.disconnect('You were kicked from the server.', DisconnectReason.Kicked);
		}

		// Log the player's join.
		this.serenity.logger.info(`${player.username} (${player.xuid}) joined the server.`);
	}
}

export { PlayerJoined };
