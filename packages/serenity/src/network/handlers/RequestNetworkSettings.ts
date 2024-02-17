import type { Packet } from '@serenityjs/bedrock-protocol';
import {
	CompressionMethod,
	DisconnectReason,
	NetworkSettings,
	RequestNetworkSettings,
} from '@serenityjs/bedrock-protocol';
import type { NetworkSession } from '../Session.js';
import { NetworkHandler } from './NetworkHandler.js';

class RequestNetworkSettingsHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet: Packet = RequestNetworkSettings.ID;

	public static override async handle(packet: RequestNetworkSettings, session: NetworkSession): Promise<void> {
		// Check if the client is using the correct protocol version.
		const protocol = this.serenity.protocol;

		// Check is the servers protocol is greater than the clients protocol.
		// This would mean the client needs to be updated.
		// Also check if the servers protocol is less than the clients protocol.
		// This would mean the server needs to be updated.
		if (protocol > packet.protocol) {
			return session.disconnect(
				'Outdated client! Please use the latest version of Minecraft Bedrock.',
				DisconnectReason.OutdatedClient,
			);
		} else if (protocol < packet.protocol) {
			return session.disconnect(
				'Outdated server! Please wait for the server to update.',
				DisconnectReason.OutdatedServer,
			);
		}

		// Now we will send the network settings to the client.
		// The client will use these settings to configure their network.
		// TODO: Add a way to configure these settings in the future.
		// I believe nintendo switch has a different compression threshold, not positive though. Needs testing.
		const settings = new NetworkSettings();
		settings.compressionThreshold = 256;
		settings.compressionMethod = CompressionMethod.Zlib;
		settings.clientThrottle = false;
		settings.clientThreshold = 0;
		settings.clientScalar = 0;

		// Send the settings to the client.
		await session.send(settings);

		// Set the compression to true.
		// For here on out, all packets will be compressed.
		session.compression = true;
	}
}

export { RequestNetworkSettingsHandler };
