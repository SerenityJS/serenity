import { RemoteInfo, Socket, createSocket } from "node:dgram";

import { Emitter } from "@serenityjs/emitter";

import { NetworkIdentifier, RaknetEvents } from "../types";
import { Bitflags, RaknetTickLength } from "../constants";

import { Offline } from "./offline";
import { Connection } from "./connection";

class RaknetServer extends Emitter<RaknetEvents> {
	protected interval: NodeJS.Timeout | null = null;

	public readonly socket: Socket;

	public readonly address: string;

	public readonly port: number;

	public readonly guid: bigint;

	public readonly connections: Map<string, Connection>;

	public constructor(address: string, port = 19_132) {
		super();
		this.socket = createSocket("udp4");
		this.address = address;
		this.port = port;
		this.guid = BigInt(Math.floor(Math.random() * 2 ** 64));
		this.connections = new Map();

		Offline.server = this;
	}

	public start() {
		try {
			this.socket.bind(this.port, this.address);

			this.socket.on("message", this.incoming.bind(this));

			// Emit any socket errors that may occur
			this.socket.on("error", (error) => this.emit("error", error));

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
			void this.emit(
				"error",
				new Error(
					"Failed to bind to the address and port, make sure the address and port are not in use."
				)
			);
		}
	}

	public send(buffer: Buffer, identifier: NetworkIdentifier): void {
		this.socket.send(buffer, identifier.port, identifier.address);
	}

	private incoming(buffer: Buffer, rinfo: RemoteInfo): void {
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
	}
}

export { RaknetServer };
