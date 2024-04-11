import {
	RequestNetworkSettingsPacket,
	PROTOCOL_VERSION,
	DisconnectReason,
	NetworkSettingsPacket
} from "@serenityjs/protocol";

import { SerenityHandler } from "./serenity-handler";

import type { NetworkSession } from "@serenityjs/network";

/**
 * Handles the request network settings packet.
 */
class RequestNetworkSettings extends SerenityHandler {
	public static packet = RequestNetworkSettingsPacket.id;

	public static handle(
		packet: RequestNetworkSettingsPacket,
		session: NetworkSession
	): void {
		// We need to check if the client is using the correct protocol version.

		// Check is the servers protocol is greater than the clients protocol.
		// This would mean the client needs to be updated.
		// Also check if the servers protocol is less than the clients protocol.
		// This would mean the server needs to be updated.
		if (PROTOCOL_VERSION > packet.protocol) {
			// Send the client the servers protocol version.
			return session.disconnect(
				"Outdated client! Please use the latest version of Minecraft Bedrock.",
				DisconnectReason.OutdatedClient
			);
		} else if (PROTOCOL_VERSION < packet.protocol) {
			// Send the client the servers protocol version.
			return session.disconnect(
				"Outdated server! Please wait for the server to be updated.",
				DisconnectReason.OutdatedServer
			);
		}

		// Once we have determined that the client is using the correct protocol version,
		// We can send the client the network settings.
		// Will will assign the values from the network instance to the settings packet.
		const settings = new NetworkSettingsPacket();
		settings.compressionThreshold = this.network.compressThreshold;
		settings.compressionMethod = this.network.compressMethod;
		settings.clientThrottle = false;
		settings.clientThreshold = 0;
		settings.clientScalar = 0;

		// Send the settings packet to the client.
		session.send(settings);

		// We can now enable compression for the session.
		// For this point on, some packets will be compressed.
		session.compression = true;
	}
}

export { RequestNetworkSettings };
