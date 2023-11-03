import { CompressionMethod, DisconectReason, NetworkSettings, type RequestNetworkSettings } from '@serenityjs/protocol';
import type { NetworkSession } from '../NetworkSession';
import { SessionHandler } from './SessionHandler';

class RequestNetworkSettingsHandler extends SessionHandler {
	public static override handle(packet: RequestNetworkSettings, session: NetworkSession): void {
		const protocol = this.serenity.protocolVerison;
		// Check if the player is using the correct protocol version
		if (protocol > packet.protocol) {
			this.logger.warn(
				`Player "${session.session.guid}" tried to join with protocol version "${packet.protocol}" but the server is using protocol version "${protocol}"!`,
			);

			return session.disconnect(
				'Outdated client! Please use the latest version of Minecraft.',
				false,
				DisconectReason.OutdatedClient,
			);
		} else if (protocol < packet.protocol) {
			this.logger.warn(
				`Player "${session.session.guid}" tried to join with protocol version "${packet.protocol}" but the server is using protocol version "${protocol}"!`,
			);

			return session.disconnect(
				'Outdated server! Please use the latest version of SerenityJS.',
				false,
				DisconectReason.OutdatedServer,
			);
		}

		// Create a new network settings object
		const settings = new NetworkSettings();
		settings.compressionThreshold = 256;
		settings.compressionMethod = CompressionMethod.Zlib;
		settings.clientThrottle = false;
		settings.clientThreshold = 0;
		settings.clientScalar = 0;

		// Send the network settings to the player
		session.send(settings.serialize());

		// Turn on compression
		session.compression = true;
	}
}

export { RequestNetworkSettingsHandler };
