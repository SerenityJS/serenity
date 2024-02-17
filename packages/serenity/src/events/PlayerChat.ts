import type { Text } from '@serenityjs/bedrock-protocol';
import { Packet } from '@serenityjs/bedrock-protocol';
import type { Serenity } from '../Serenity.js';
import { NetworkStatus, type NetworkPacketEvent } from '../network/index.js';
import type { Player } from '../player/index.js';
import { HookMethod } from '../types/index.js';
import { AbstractEvent } from './AbstractEvent.js';

class PlayerChat extends AbstractEvent {
	public static serenity: Serenity;

	public static readonly hook = Packet.Text;
	public static readonly method = HookMethod.Before;

	public readonly player: Player;
	public message: string;
	public source: string;

	public constructor(player: Player, message: string, source: string) {
		super();
		this.player = player;
		this.message = message;
		this.source = source;
	}

	public static async logic(data: NetworkPacketEvent<Text>): Promise<boolean> {
		// Separate the data into variables.
		const { session, player, status, packet } = data;

		// Check if the player exists.
		if (!player) {
			this.serenity.logger.error(
				`Failed to find player instance for ${session.identifier.address}:${session.identifier.port}! PlayerChat.logic()`,
			);

			return false;
		}

		// Check if the packet is incoming. Meaning the packet is being sent to by client.
		// Return true if the packet is not incoming.
		// This will allow the packets that are outgoing to be sent to the client.
		if (status !== NetworkStatus.Incoming) return true;

		// Check if the source is null.
		// If it is, we will set the source to the player's username.
		if (packet.source === null) packet.source = player.username;

		// Construct the event.
		const event = new PlayerChat(player, packet.message, packet.source);

		// Call the event.
		const value = await this.serenity.emit('PlayerChat', event);

		// Reassign variables to the packet.
		packet.message = event.message;
		packet.source = event.source;

		// Return the value of the event.
		// This is incase the event was cancelled,
		// so the packet handler will not be called.
		return value;
	}
}

export { PlayerChat };
