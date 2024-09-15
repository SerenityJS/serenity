import {
	DisconnectReason,
	ServerboundDiagnosticsPacket
} from "@serenityjs/protocol";

import { SerenityHandler } from "./serenity-handler";

import type { NetworkSession } from "@serenityjs/network";

class ServerboundDiagnostics extends SerenityHandler {
	public static readonly packet = ServerboundDiagnosticsPacket.id;

	public static handle(
		packet: ServerboundDiagnosticsPacket,
		session: NetworkSession
	): void {
		// Get the player from the session
		// If there is no player, then disconnect the session.
		const player = this.serenity.getPlayer(session);
		if (!player)
			return session.disconnect(
				"Failed to connect due to an invalid player. Please try again.",
				DisconnectReason.InvalidPlayer
			);

		// Get the diagnostics from the player
		const diagnostics = player.diagnostics;

		// Set the diagnostics enabled property to true
		if (!diagnostics.enabled) diagnostics.enabled = true;

		// Set the diagnostics properties
		diagnostics.fps = packet.fps;
		diagnostics.serverSimTickTime = packet.serverSimTickTime;
		diagnostics.clientSimTickTime = packet.clientSimTickTime;
		diagnostics.beginFrameTime = packet.beginFrameTime;
		diagnostics.inputTime = packet.inputTime;
		diagnostics.renderTime = packet.renderTime;
		diagnostics.endFrameTime = packet.endFrameTime;
		diagnostics.remainderTimePercent = packet.remainderTimePercent;
		diagnostics.unaccountedTimePercent = packet.unaccountedTimePercent;
	}
}

export { ServerboundDiagnostics };
