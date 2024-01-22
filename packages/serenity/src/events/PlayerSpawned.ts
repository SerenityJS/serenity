import type { SetLocalPlayerAsInitialized } from '@serenityjs/bedrock-protocol';
import { DisconnectReason, Packet, PlayerStatus } from '@serenityjs/bedrock-protocol';
import type { Serenity } from '../Serenity';
import { NetworkStatus, type NetworkPacketEvent, type NetworkSession } from '../network';
import { HookMethod } from '../types';
import { AbstractEvent } from './AbstractEvent';

class PlayerSpawned extends AbstractEvent {
	protected readonly serenity: Serenity;

	public readonly hook = Packet.SetLocalPlayerAsInitialized;
	public readonly method = HookMethod.After;

	public constructor(serenity: Serenity) {
		super();

		this.serenity = serenity;
	}

	public async logic(data: NetworkPacketEvent<SetLocalPlayerAsInitialized>): Promise<void> {
		// Separate the data into variables.
		const { session, status } = data;

		// Check if the packet is incoming. Meaning the packet is being sent to by client.
		if (status !== NetworkStatus.Incoming) return;

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
		const value = await this.serenity.emit('PlayerSpawned', player);

		// If the value is false, the event was cancelled.
		// In this case, we disconnect the player.
		if (!value) {
			return session.disconnect('You were kicked from the server.', DisconnectReason.Kicked);
		}

		// Log the player spawning.
		this.serenity.logger.info(`${player.username} (${player.xuid}) spawned in the server.`);
	}
}

export { PlayerSpawned };
