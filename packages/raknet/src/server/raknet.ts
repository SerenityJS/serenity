import { RemoteInfo, Socket, createSocket } from "node:dgram";

import { Emitter } from "@serenityjs/emitter";
import { Logger, LoggerColors } from "@serenityjs/logger";

import { NetworkIdentifier, RaknetEvents } from "../types";
import { RaknetTickLength } from "../constants";
import { Bitflags } from "../enums";

import { Offline } from "./offline";
import { Connection } from "./connection";

/**
 * The raknet server
 */
class RaknetServer extends Emitter<RaknetEvents> {
	/**
	 * The server tick interval
	 */
	protected interval: NodeJS.Timeout | null = null;

	/**
	 * The raknet server logger
	 */
	public readonly logger: Logger;

	/**
	 * The server socket
	 */
	public readonly socket: Socket;

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
	public readonly guid: bigint;

	/**
	 * The server connections
	 */
	public readonly connections: Map<string, Connection>;

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
	 * Creates a new raknet server
	 * @param address the server address
	 * @param port the server port
	 */
	public constructor(address: string, port = 19_132) {
		super();
		this.logger = new Logger("Raknet", LoggerColors.CyanBright);
		this.socket = createSocket("udp4");
		this.address = address;
		this.port = port;
		this.guid = BigInt(Math.floor(Math.random() * 2 ** 64));
		this.connections = new Map();

		Offline.server = this;
	}

	/**
	 * Starts the server
	 */
	public start() {
		try {
			// Bind the socket to the address and port
			this.socket.bind(this.port, this.address);

			// Bind the socket message event to the incoming function
			this.socket.on("message", this.incoming.bind(this));

			// Emit any socket errors that may occur
			this.socket.on("error", (error) => this.emit("error", error));

			// Create the tick function
			const tick = () =>
				setTimeout(() => {
					for (const [, connection] of this.connections) {
						// Tick the connection
						connection.tick();
					}

					tick();
				}, RaknetTickLength);

			// Sets the interval to the tick function
			this.interval = tick().unref();
		} catch {
			// Log an error for failing to bind to the address and port
			this.logger.error(
				`Failed to bind to the address and port, make sure the address and port are not in use.`
			);

			void this.emit(
				"error",
				new Error(
					"Failed to bind to the address and port, make sure the address and port are not in use."
				)
			);
		}
	}

	/**
	 * Stops the server
	 */
	public stop() {
		try {
			// Clear the interval
			if (this.interval) clearInterval(this.interval);

			// Close the socket
			this.socket.close();
		} catch {
			void this.emit("error", new Error("Failed to close the server"));
		}
	}

	/**
	 * Sends a buffer to the specified network identifier
	 * @param buffer the buffer to send
	 * @param identifier the network identifier to send the buffer to
	 */
	public send(buffer: Buffer, identifier: NetworkIdentifier): void {
		this.socket.send(buffer, identifier.port, identifier.address);
	}

	/**
	 * Handles incoming packets
	 * @param buffer the packet buffer
	 * @param rinfo the remote info
	 */
	private incoming(buffer: Buffer, rinfo: RemoteInfo): void {
		try {
			// Deconstructs the packet into its buffer, address, port, and version
			const { address, port, family } = rinfo;

			// Constructs the identifier from the address, port, and version
			const version = family === "IPv4" ? 4 : 6;

			// Creates the identifier key from the address and port
			const identifier: NetworkIdentifier = { address, port, version };
			const key = `${address}:${port}:${version}`;

			// Get the connection from the connections map
			const connection = this.connections.get(key);

			// Check if the connection is valid & the buffer is valid
			if (connection && (buffer[0]! & Bitflags.Valid) !== 0)
				return connection.incoming(buffer);

			// Check if we got a valid packet, without a valid connection
			if ((buffer[0]! & Bitflags.Valid) !== 0) {
				// Log a debug message for the invalid packet
				this.logger.debug(
					`Received a valid packet without a valid connection from ${key}`
				);

				// Emit an error for the invalid packet
				return void this.emit(
					"error",
					new Error(
						"Received a valid packet without a valid connection from " + key
					)
				);
			}

			// Let the offline handler handle the incoming packet
			return Offline.incoming(buffer, identifier);
		} catch (reason: Error | unknown) {
			// Log an error for the incoming packet
			this.logger.error(
				`Failed to handle incoming packet from ${rinfo.address}:${rinfo.port}, "${(reason as Error).message}"`
			);

			// Emit an error for the incoming packet
			void this.emit("error", reason as Error);
		}
	}
}

export { RaknetServer };
