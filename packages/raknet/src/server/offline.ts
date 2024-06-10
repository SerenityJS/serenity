import { MaxMtuSize, Protocol, udpHeaderSize } from "../constants";
import { Packet } from "../enums";
import {
	Address,
	OpenConnectionReply1,
	OpenConnectionReply2,
	OpenConnectionRequest1,
	OpenConnectionRequest2,
	UnconnectedPing,
	UnconnectedPong
} from "../proto";

import { Connection } from "./connection";

import type { NetworkIdentifier } from "../types";
import type { Server } from "./raknet";

/**
 * Handles all ofline raknet server operations
 */
class Offline {
	/**
	 * The server instance
	 */
	public static server: Server;

	/**
	 * Handles all incoming offline packets
	 * @param buffer The packet buffer
	 * @param identifier The network identifier
	 */
	public static incoming(buffer: Buffer, identifier: NetworkIdentifier): void {
		// Read the packet header
		const header = buffer[0] as number;

		// Switch based on the packet header
		switch (header) {
			default: {
				// Format the packet id to a hex string
				const id =
					header.toString(16).length === 1
						? "0" + header.toString(16)
						: header.toString(16);

				// Emit an error for unknown packet headers
				return void this.server.emit(
					"error",
					new Error(
						`Unknown packet header "0x${id}" from ${identifier.address}:${identifier.port}`
					)
				);
			}

			// Unconnected ping is the first packet sent by the client
			case Packet.UnconnectedPing: {
				// Handle the unconnected ping
				this.handleUnconnectedPing(buffer, identifier);
				break;
			}

			// Open connection request 1 is the next packet sent by the client
			case Packet.OpenConnectionRequest1: {
				// Handle the open connection request 1
				this.handleOpenConnectionRequest1(buffer, identifier);
				break;
			}

			// Open connection request 2 is the next packet sent by the client
			case Packet.OpenConnectionRequest2: {
				// Handle the open connection request 2
				this.handleOpenConnectionRequest2(buffer, identifier);
				break;
			}
		}
	}

	/**
	 * Handles an unconnected ping
	 * @param buffer The packet buffer
	 * @param identifier The network identifier
	 */
	private static handleUnconnectedPing(
		buffer: Buffer,
		identifier: NetworkIdentifier
	): void {
		// Deserialize the ping packet
		const ping = new UnconnectedPing(buffer).deserialize();

		// Create a new pong packet
		const pong = new UnconnectedPong();

		// Assign the packet properties
		pong.timestamp = ping.timestamp;
		pong.guid = this.server.guid;
		pong.message =
			[
				"MCPE", // MCEE = Minecraft: Education Edition
				this.server.message ?? "Raknet Server",
				this.server.protocol ?? 100,
				this.server.version ?? "1.0.0",
				this.server.connections.size,
				this.server.maxConnections ?? 10,
				this.server.guid,
				"SerenityJS",
				"Survival",
				1,
				this.server.port,
				this.server.port + 1
			].join(";") + ";";

		// Send the pong packet
		return this.server.send(pong.serialize(), identifier);
	}

	/**
	 * Handles an open connection request 1
	 * @param buffer The packet buffer
	 * @param identifier The network identifier
	 */
	private static handleOpenConnectionRequest1(
		buffer: Buffer,
		identifier: NetworkIdentifier
	): void {
		// Create a new open connection request 1 packet
		// And deserialize the buffer
		const request = new OpenConnectionRequest1(buffer).deserialize();

		// Check if the protocol version is supported
		// If not, we will send an incompatible protocol version packet
		if (request.protocol !== Protocol) {
			return;
		}

		// Create a new open connection reply 1 packet
		// And assign the packet properties
		const reply = new OpenConnectionReply1();
		reply.guid = this.server.guid;
		reply.security = false;

		// Check the connections MTU size
		// And adjust if it is larger than the standard Raknet MTU size
		// MTU size is calculated by adding the size of the packet to the size of the UDP header
		const size = request.getBuffer().byteLength + udpHeaderSize;
		reply.mtu = size > MaxMtuSize ? MaxMtuSize : size;

		// Send the reply packet
		return this.server.send(reply.serialize(), identifier);
	}

	/**
	 * Handles an open connection request 2
	 * @param buffer The packet buffer
	 * @param identifier The network identifier
	 */
	private static handleOpenConnectionRequest2(
		buffer: Buffer,
		identifier: NetworkIdentifier
	): void {
		// Create a new open connection request 2 packet
		// And deserialize the buffer
		const request = new OpenConnectionRequest2(buffer).deserialize();
		const key = `${identifier.address}:${identifier.port}:${identifier.version}`;

		// Create a new reply packet
		// And set the properties of the reply packet
		const reply = new OpenConnectionReply2();
		reply.guid = this.server.guid;
		reply.address = Address.fromIdentifier(identifier);
		reply.mtu = request.mtu;
		reply.encryption = false;

		// Create a new connection, and add it to the connections map
		const connection = new Connection(
			this.server,
			identifier,
			request.client,
			request.mtu
		);
		this.server.connections.set(key, connection);

		// Send the reply packet
		return this.server.send(reply.serialize(), identifier);
	}
}

export { Offline };
