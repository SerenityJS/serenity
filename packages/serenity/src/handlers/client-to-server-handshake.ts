import { ClientToServerHandshakePacket } from "@serenityjs/protocol";

import { SerenityHandler } from "./serenity-handler";

import type { NetworkSession } from "@serenityjs/network";

class ClientToServerHandshake extends SerenityHandler {
	public static readonly packet = ClientToServerHandshakePacket.id;

	public static handle(
		_: ClientToServerHandshakePacket,
		session: NetworkSession
	) {
		this.network.logger.debug(
			"Encryption enabled and aknowledged for session",
			`"${session.identifier.address}:${session.identifier.port}"!`
		);
	}
}

export { ClientToServerHandshake };
