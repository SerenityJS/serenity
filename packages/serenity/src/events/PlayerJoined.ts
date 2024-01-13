import type { PlayStatus } from '@serenityjs/bedrock-protocol';
import { DisconnectReason, Packet, PlayerStatus } from '@serenityjs/bedrock-protocol';
import type { Serenity } from '../Serenity';
import { NetworkStatus, type NetworkPacketEvent } from '../network';
import { AbstractEvent } from './AbstractEvent';

class PlayerJoined extends AbstractEvent {
	protected readonly serenity: Serenity;
	public readonly packetHook = Packet.PlayStatus;

	public constructor(serenity: Serenity) {
		super();

		this.serenity = serenity;
	}

	public async logic(data: NetworkPacketEvent<PlayStatus>): Promise<void> {
		// Separate the data into variables.
		const { packet, session, status } = data;

		// Check if the player's status is login success.
		// Also check if the packet is outgoing. Meaning the packet is being sent to the client.
		if (packet.status !== PlayerStatus.LoginSuccess || status !== NetworkStatus.Outgoing) return;

		// First we need to check if their is a player instance.
		const player = session.getPlayerInstance();
		if (!player) {
			return this.serenity.logger.error(
				`Failed to find player instance for ${session.identifier.address}:${session.identifier.port}!`,
			);
		}

		// Emit the new player event.
		// Await the event to ensure that no data was changed.
		const value = await this.serenity.emit('PlayerJoined', player);

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
