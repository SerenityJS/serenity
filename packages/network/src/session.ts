import { Connection, NetworkIdentifier, Priority } from "@serenityjs/raknet";
import {
	DisconnectReason,
	DisconnectPacket,
	DataPacket
} from "@serenityjs/protocol";

import { Network } from "./network";

/**
 * Represents a network session.
 */
class NetworkSession {
	/**
	 * The network instance.
	 */
	public readonly network: Network;

	/**
	 * The raknet connection instance.
	 */
	public readonly connection: Connection;

	/**
	 * The globably unique identifier of the session.
	 */
	public readonly guid: bigint;

	/**
	 * The network identifier of the session.
	 */
	public readonly identifier: NetworkIdentifier;

	/**
	 * Whether the session is using encryption.
	 */
	public encryption: boolean = false;

	/**
	 * Whether the session is using compression.
	 */
	public compression: boolean = false;

	/**
	 * Creates a new network session.
	 *
	 * @param network The network instance.
	 * @param connection The raknet connection.
	 * @returns A new network session.
	 */
	public constructor(network: Network, connection: Connection) {
		this.network = network;
		this.connection = connection;
		this.guid = connection.guid;
		this.identifier = connection.identifier;
	}

	/**
	 * Disconnects the session from the server.
	 * @param message The message to send to the client.
	 * @param reason The reason for the disconnection.
	 * @param hideReason Whether to hide the disconnection screen.
	 */
	public disconnect(
		message: string,
		reason: DisconnectReason,
		hideReason = false
	): void {
		// Create a new disconnect packet.
		const packet = new DisconnectPacket();

		// Assign the packet properties.
		packet.message = message;
		packet.reason = reason;
		packet.hideDisconnectScreen = hideReason;

		// Send the packet with the highest priority.
		this.network.send(this, Priority.Immediate, packet);

		// Disconnect the raknet connection.
		this.connection.disconnect();
	}

	/**
	 * Sends a packet to the client.
	 * @param packets The packets to send.
	 */
	public send(...packets: Array<DataPacket>): void {
		return this.network.send(this, Priority.Normal, ...packets);
	}

	/**
	 * Sends a packet to the client with the highest priority.
	 * @param packets The packets to send.
	 */
	public sendImmediate(...packets: Array<DataPacket>): void {
		return this.network.send(this, Priority.Immediate, ...packets);
	}
}

export { NetworkSession };
