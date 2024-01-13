import type { Disconnect } from '@serenityjs/bedrock-protocol';
import { DisconnectReason, Packet, PlayerStatus } from '@serenityjs/bedrock-protocol';
import type { Serenity } from '../Serenity';
import { NetworkStatus, type NetworkPacketEvent, type NetworkSession } from '../network';
import { AbstractEvent } from './AbstractEvent';

class PlayerLeft extends AbstractEvent {
	protected readonly serenity: Serenity;
	public readonly packetHook = Packet.Disconnect;

	public constructor(serenity: Serenity) {
		super();

		this.serenity = serenity;
	}

	public async logic(data: NetworkPacketEvent<Disconnect>): Promise<void> {
		// Separate the data into variables.
		const { packet, session, status } = data;

		// Check if the disconnect reason is "disconnected".
		// Also check if the packet is incoming. Meaning the packet is being sent to by client.
		if (packet.reason !== DisconnectReason.Disconnected || status !== NetworkStatus.Incoming) return;

		// First we need to check if their is a player instance.
		const player = session.getPlayerInstance();
		if (!player) {
			return this.serenity.logger.error(
				`Failed to find player instance for ${session.identifier.address}:${session.identifier.port}!`,
			);
		}

		// Emit the new player event.
		// Await the event to ensure that no data was changed.
		// Which in this case, it doesn't matter if the data was changed.
		const value = await this.serenity.emit('PlayerLeft', player);

		// If the value is false, the event was cancelled.
		// In this case, we will log an error.
		// We can't disconnect the player since they already disconnected.
		if (!value) {
			return this.serenity.logger.error(
				'PlayerLeft event can not be cancelled, the player has already terminated the connection.',
			);
		}

		// Log the player leaving.
		this.serenity.logger.info(`${player.username} (${player.xuid}) left the server.`);
	}
}

export { PlayerLeft };
