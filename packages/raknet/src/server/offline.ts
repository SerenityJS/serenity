import { Packet } from "../enums";
import {
	Address,
	IncompatibleProtocolVersion,
	OpenConnectionReply1,
	OpenConnectionReply2,
	OpenConnectionRequest1,
	OpenConnectionRequest2,
	UnconnectedPing,
	UnconnectedPong
} from "../proto";
import { RAKNET_PROTOCOL, UDP_HEADER_SIZE } from "../constants";

import { Connection } from "./connection";

import type { RemoteInfo } from "node:dgram";
import type { Server } from "./raknet";

class Offline {
	/**
	 * The raknet server instance
	 */
	public static server: Server;

	/**
	 * Handles all incoming offline datagrams from remote clients
	 * @param buffer The packet buffer from the remote client
	 * @param rinfo The remote client information
	 */
	public static handle(buffer: Buffer, rinfo: RemoteInfo): void {
		// Get the first byte of the buffer, this is the packet header.
		// The packet header contains the packet identifier.
		const header = buffer[0];

		// Sanity check for the packet header
		if (!header) throw new Error("Invalid offline packet header");

		// Hand off the packet to the appropriate handler based on the packet header
		switch (header) {
			case Packet.UnconnectedPing: {
				// This handshake displays the server information to the client (motd, ping, etc.)
				this.unconnectedPing(buffer, rinfo);
				break;
			}

			case Packet.OpenConnectionRequest1: {
				// This handshake is the first step in establishing a connection with the server
				this.openConnectionRequest1(buffer, rinfo);
				break;
			}

			case Packet.OpenConnectionRequest2: {
				// This handshake is the second step in establishing a connection with the server
				this.openConnectionRequest2(buffer, rinfo);
				break;
			}

			default: {
				// Format the packet id to a hex string
				const id =
					header.toString(16).length === 1
						? "0" + header.toString(16)
						: header.toString(16);

				// Log a debug message for the unknown packet header
				this.server.logger.debug(
					`Received an unknown offline packet identifier "0x${id}" from ${rinfo.address}:${rinfo.port}`
				);
			}
		}
	}

	/**
	 * Handles an unconnected ping packet
	 * @param buffer The packet buffer from the remote client
	 * @param rinfo The remote client information
	 */
	public static unconnectedPing(buffer: Buffer, rinfo: RemoteInfo): void {
		// Deserialize the unconnected ping
		const ping = new UnconnectedPing(buffer).deserialize();

		// Create a new unconnected pong packet
		const pong = new UnconnectedPong();
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

		// Send the unconnected pong packet to the remote client
		this.server.send(pong.serialize(), rinfo);
	}

	/**
	 * Handles an open connection request 1 packet
	 * @param buffer The packet buffer from the remote client
	 * @param rinfo The remote client information
	 */
	public static openConnectionRequest1(
		buffer: Buffer,
		rinfo: RemoteInfo
	): void {
		// Deserialize the open connection request 1 packet
		const request = new OpenConnectionRequest1(buffer).deserialize();

		// Check if the raknet protocol versions are mismatched
		// The raknet protocol version varies between different versions of the game
		// There seems to be minor differences between the versions.
		if (request.protocol !== RAKNET_PROTOCOL) {
			// Create a new incompatible protocol version packet
			const incompatible = new IncompatibleProtocolVersion();
			incompatible.protocol = RAKNET_PROTOCOL;
			incompatible.guid = this.server.guid;

			// Log a warning message for the incompatible protocol version
			this.server.logger.warn(
				`Refusing connection from ${rinfo.address}:${rinfo.port} due to incompatible protocol version v${request.protocol}, expected v${RAKNET_PROTOCOL}.`
			);

			// Send the incompatible protocol version packet to the remote client
			return this.server.send(incompatible.serialize(), rinfo);
		}

		// Create a new open connection reply 1 packet
		const reply = new OpenConnectionReply1();
		reply.guid = this.server.guid;
		reply.security = false; // We are not using security
		reply.mtu =
			// Check if the requested mtu + the udp header size is greater than the maximum mtu size
			request.mtu + UDP_HEADER_SIZE > this.server.maxMtuSize
				? this.server.maxMtuSize // Assign the maximum transfer unit size
				: request.mtu + UDP_HEADER_SIZE; // Assign the requested transfer unit size + the udp header size

		// Send the open connection reply 1 packet to the remote client
		return this.server.send(reply.serialize(), rinfo);
	}

	/**
	 * Handles an open connection request 2 packet
	 * @param buffer The packet buffer from the remote client
	 * @param rinfo The remote client information
	 */
	public static openConnectionRequest2(
		buffer: Buffer,
		rinfo: RemoteInfo
	): void {
		// Deserialize the open connection request 2 packet
		const request = new OpenConnectionRequest2(buffer).deserialize();

		// Check if the requested port matches the server port
		// This is a unlikely scenario, but it is possible
		if (request.address.port !== this.server.port) {
			// Log a warning message for the mismatched port
			return this.server.logger.warn(
				`Refusing connection from ${rinfo.address}:${rinfo.port} due to mismatched port.`
			);
		}

		// Check if the mtu size is between the allowed minimum and maximum mtu size.
		// If not, we will refuse the connection.
		if (
			request.mtu < this.server.minMtuSize ||
			request.mtu > this.server.maxMtuSize
		) {
			// Log a warning message for the invalid mtu size
			return this.server.logger.warn(
				`Refusing connection from ${rinfo.address}:${rinfo.port} due to invalid mtu size.`
			);
		}

		// Check if the connection is already established
		const connection = [...this.server.connections.values()].find(
			(x) => x.rinfo.address === rinfo.address && x.rinfo.port === rinfo.port
		);

		// Check if the connection is already established
		if (connection) {
			// Log a warning message for the already established connection
			return this.server.logger.warn(
				`Refusing connection from ${rinfo.address}:${rinfo.port} due to already established connection.`
			);
		}

		// Create a new open connection reply 2 packet
		const reply = new OpenConnectionReply2();
		reply.guid = this.server.guid;
		reply.address = Address.fromIdentifier(rinfo);
		reply.mtu = request.mtu;
		reply.encryption = false; // We are not using encryption

		// Log a debug message for the successful connection
		this.server.logger.debug(
			`Establishing connection from ${rinfo.address}:${rinfo.port} with mtu size of ${request.mtu}.`
		);

		// Create a new connection, and add it to the connections set
		this.server.connections.add(
			// Build a new connection instance
			new Connection(this.server, rinfo, request.client, request.mtu)
		);

		// Send the open connection reply 2 packet to the remote client
		return this.server.send(reply.serialize(), rinfo);
	}
}

export { Offline };
