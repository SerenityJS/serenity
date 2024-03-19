import {
	PacketViolationWarningPacket,
	ViolationSeverity,
	ViolationType
} from "@serenityjs/protocol";

import { NetworkHandler } from "./network-handler";

import type { Packet } from "@serenityjs/protocol";
import type { NetworkSession } from "../session";

class PacketViolationWarningHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet: Packet = PacketViolationWarningPacket.id;

	public static override handle(
		packet: PacketViolationWarningPacket,
		session: NetworkSession
	): void {
		// Format the packet id.
		const id =
			packet.packet.toString(16).length === 1
				? `0${packet.packet.toString(16)}`
				: packet.packet.toString(16);

		// Log the packet violation warning.
		this.serenity.network.logger.warn(
			`Recieved a "${ViolationType[packet.type]}" packet violation warning for packet "0x${id}" with a "${
				ViolationSeverity[packet.severity]
			}" severity! Packet origin: ${session.identifier.address}:${session.identifier.port}, Violation context: ${
				packet.context
			}`
		);
	}
}

export { PacketViolationWarningHandler };
