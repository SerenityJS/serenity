import { type RemoteInfo, createSocket } from "node:dgram";

import { Emitter } from "@serenityjs/emitter";
import { Logger, LoggerColors } from "@serenityjs/logger";

import { MAX_MTU_SIZE, MIN_MTU_SIZE, RAKNET_TICK_LEN } from "../constants";
import { Bitflags } from "../enums";

import { Offline } from "./offline";

import type { RaknetEvents } from "../types";
import type { Connection } from "./connection";

/**
 * The raknet server
 */
class Server extends Emitter<RaknetEvents> {
	/**
	 * The server tick interval
	 */
	protected interval: NodeJS.Timeout | null = null;

	/**
	 * The raknet server logger
	 */
	public readonly logger = new Logger("Raknet", LoggerColors.CyanBright);

	/**
	 * The server socket
	 */
	public readonly socket = createSocket("udp4");

	/**
	 * The server address
	 */
	public readonly address: string;

	/**
	 * The server port
	 */
	public readonly port: number;

	/**
	 * The server guid
	 */
	public readonly guid = BigInt(Math.floor(Math.random() * 2 ** 64));

	/**
	 * The server connections
	 */
	public readonly connections = new Set<Connection>();

	/**
	 * The server max mtu size
	 */
	public readonly maxMtuSize: number;

	/**
	 * The server min mtu size
	 */
	public readonly minMtuSize: number;

	/**
	 * The server protocol
	 */
	public protocol: number | null = null;

	/**
	 * The server version
	 */
	public version: string | null = null;

	/**
	 * The server message
	 */
	public message: string | null = null;

	/**
	 * The server max connections
	 */
	public maxConnections: number | null = null;

	/**
	 * Weather the server is alive
	 */
	public alive = true;

	/**
	 * Creates a new raknet server
	 * @param address the server address
	 * @param port the server port
	 */
	public constructor(
		address: string,
		port = 19_132,
		mtuMaxSize = MAX_MTU_SIZE,
		mtuMinSize = MIN_MTU_SIZE
	) {
		super();
		this.address = address;
		this.port = port;
		this.maxMtuSize = mtuMaxSize;
		this.minMtuSize = mtuMinSize;

		// Bind the incoming messages to the handle method
		this.socket.on("message", this.handle.bind(this));
		this.socket.unref();

		// Bind server instance to the offline handler
		Offline.server = this;
	}

	/**
	 * Starts the server
	 */
	public start() {
		this.socket.bind(this.port, this.address);

		// Create a tick function
		const tick = () =>
			setTimeout(() => {
				// Check if the server is alive, if not clear the interval
				if (!this.alive || !this.interval) return;

				// Update the connections for the server
				for (const connection of this.connections) connection.tick();

				// Call the tick method for each connection
				return tick();
			}, RAKNET_TICK_LEN);

		// Set the interval to the tick method
		this.interval = tick().unref();
	}

	/**
	 * Stops the server
	 */
	public stop() {
		try {
			// Clear the interval
			if (this.interval) this.interval = null;

			// Close the socket
			this.socket.close();
		} catch {
			void this.emit("error", new Error("Failed to close the server"));
		}
	}

	protected handle(buffer: Buffer, rinfo: RemoteInfo): void {
		// Get the first byte of the buffer, this is the packet header.
		// The packet header contains the packet identifier and the flags associated with the packet.
		const header = buffer[0];

		// Sanity check for the packet header
		if (!header) throw new Error("Invalid packet header");

		// Check if the datagram is an offline packet, if so handle it accordingly
		const offline = (header & Bitflags.Valid) === 0;

		// Attempt to find the connection in the connection set
		const connection = [...this.connections.values()].find(
			(x) => x.rinfo.address === rinfo.address && x.rinfo.port === rinfo.port
		);

		// Check if the remote client is not connected to the server
		// And if the remote client is sending an offline packet
		if (offline)
			// Pass the buffer and remote client information to the offline handler
			return Offline.handle(buffer, rinfo);

		// Check if the remote client has an established connection with the server
		// And if the remote client is sending a connected packet
		if (!offline && connection)
			// Pass the buffer to the connection handler
			return connection.incoming(buffer);
	}

	public send(buffer: Buffer, rinfo: RemoteInfo): void {
		this.socket.send(buffer, rinfo.port, rinfo.address);
	}
}

export { Server };
