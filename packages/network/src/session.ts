import { type Connection, Priority, Reliability } from "@serenityjs/raknet";
import {
	type DisconnectReason,
	DisconnectPacket,
	type DataPacket
} from "@serenityjs/protocol";
import Emitter from "@serenityjs/emitter";

import type { RemoteInfo } from "node:dgram";
import type { NetworkEvents } from "./types";
import type { Network } from "./network";

/**
 * Represents a network session.
 */
class NetworkSession extends Emitter<NetworkEvents> {
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
	public readonly identifier: RemoteInfo;

	/**
	 * Whether the session is using encryption.
	 */
	public encryption: boolean = false;

	/**
	 * Whether the session is using compression.
	 */
	public compression: boolean = false;

	/**
	 * The packet reliability of the session.
	 */
	public reliablity: Reliability = Reliability.ReliableOrdered;

	/**
	 * The packet ordering channel of the session.
	 */
	public channel: number = 0;

	/**
	 * Creates a new network session.
	 *
	 * @param network The network instance.
	 * @param connection The raknet connection.
	 * @returns A new network session.
	 */
	public constructor(network: Network, connection: Connection) {
		super();
		this.network = network;
		this.connection = connection;
		this.guid = connection.guid;
		this.identifier = connection.rinfo;
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
