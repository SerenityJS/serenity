import { PacketViolationWarning, ViolationSeverity, ViolationType } from '@serenityjs/bedrock-protocol';
import type { NetworkSession } from '../Session';
import { NetworkHandler } from './NetworkHandler';

class PacketViolationWarningHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet = PacketViolationWarning.ID;

	public static override async handle(packet: PacketViolationWarning, session: NetworkSession): Promise<void> {
		// Format the packet id.
		const id =
			packet.packetId.toString(16).length === 1 ? `0${packet.packetId.toString(16)}` : packet.packetId.toString(16);

		// Log the packet violation warning.
		this.serenity.network.logger.warn(
			`Recieved a "${ViolationType[packet.type]}" packet violation warning for packet "0x${id}" with a "${
				ViolationSeverity[packet.severity]
			}" severity! Packet origin: ${session.identifier.address}:${session.identifier.port}, Violation context: ${
				packet.context
			}`,
		);
	}
}

export { PacketViolationWarningHandler };
