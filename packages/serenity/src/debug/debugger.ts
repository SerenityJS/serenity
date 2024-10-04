import { Server, type Socket } from "node:net";
import { totalmem, freemem } from "node:os";

import { Logger, LoggerColors } from "@serenityjs/logger";
import {
	type DataPacket,
	DebugEventPacket,
	DebuggerProtocolVersion,
	type Packet
} from "@serenityjs/protocol";
import { NetworkBound, type NetworkPacketEvent } from "@serenityjs/network";

import type { Serenity } from "../serenity";

interface PacketStatistic {
	name: string;
	sent: number;
	received: number;
	sent_bytes: number;
	received_bytes: number;
}

class Debugger {
	/**
	 * The serenity instance.
	 */
	protected readonly serenity: Serenity;

	/**
	 * The tcp server instance.
	 */
	protected readonly server: Server = new Server();

	/**
	 * The port for the debugger.
	 */
	public readonly port: number;

	/**
	 * The logger instance.
	 */
	public readonly logger = new Logger("Debugger", LoggerColors.RedBright);

	/**
	 * The connections set.
	 */
	public readonly connections: Set<Socket> = new Set();

	/**
	 * the network stats queue.
	 */
	public readonly networkStatsQueue = new Map<Packet, PacketStatistic>();

	/**
	 * Creates a new debugger instance.
	 * @param serenity The serenity instance.
	 */
	public constructor(serenity: Serenity) {
		this.serenity = serenity;

		// Get the port for the debugger
		this.port = this.serenity.properties.getValue("debugger-port");

		// Handle the connection event.
		this.server.on("connection", this.handleConnection.bind(this));

		// Handle the data packet event.
		serenity.network.after("all", this.handleDataPacket.bind(this));
	}

	public start(): void {
		// Check if the debugger is enabled.
		if (!this.serenity.properties.getValue("debugger-enabled")) return;

		// Get the address of the server.
		const address = this.serenity.raknet.address;

		// Listen on the server.
		this.server.listen(this.port, address).unref();

		// Log the start of the debugger.
		this.logger.info(
			`Debugger is listening on §a${address}§r:§a${this.port}§r.`
		);
	}

	public stop(): void {
		// Check if the debugger is enabled.
		if (!this.serenity.properties.getValue("debugger-enabled")) return;

		// Iterate over the connections and close them.
		for (const connection of this.connections) {
			connection.destroy();
		}

		// Close the server.
		this.server.close();
	}

	public tick(deltaTick: number): void {
		// Check if there are no connections.
		if (this.connections.size === 0) return;

		// Check if the current tick is divisible by 20.
		if (this.serenity.tick % 20 !== 0) return;

		// Create a new debug event packet.
		const packet = new DebugEventPacket();

		// Map the network stats queue to the packet.
		packet.data = {
			type: "StatEvent2",
			tick: this.serenity.tick,
			stats: [
				this.generatePacketStatistics(),
				this.generateChunkStatistics(),
				this.generateMemoryStatistics(),
				this.generateJavaScriptMemoryStatistics(),
				this.generateTickStatistics(deltaTick),
				this.getEntityStatistics()
			]
		};

		// Broadcast the packet.
		this.broadcast(packet);
	}

	protected handleDataPacket(data: NetworkPacketEvent<DataPacket>): void {
		// Check if the packet is in the network stats queue.
		let stats = this.networkStatsQueue.get(
			data.packet.getId()
		) as PacketStatistic;

		// If the packet is not in the network stats queue, add it.
		if (!stats) {
			// Create a new packet statistic.
			const stat: PacketStatistic = {
				name: data.packet.constructor.name,
				sent: 0,
				received: 0,
				sent_bytes: 0,
				received_bytes: 0
			};

			// Set the packet in the network stats queue.
			this.networkStatsQueue.set(data.packet.getId(), stat);

			// Set the stats.
			stats = stat;
		}

		// Increment the stats.
		if (data.bound === NetworkBound.Server) {
			// Increment the received stats.
			stats.received++;
			stats.received_bytes += data.packet.binary.length;
		} else {
			// Increment the sent stats.
			stats.sent++;
			stats.sent_bytes += data.packet.binary.length;
		}
	}

	/**
	 * Handle the connection of the debugger client.
	 * @param socket The socket of the debugger client.
	 */
	protected handleConnection(socket: Socket): void {
		// Log the connection of the debugger client.
		this.logger.info(
			`Debugger client connected from §a${socket.remoteAddress}§r.`
		);

		// Create a new debug connection.
		const packet = new DebugEventPacket();
		packet.data = {
			type: "ProtocolVersion",
			version: DebuggerProtocolVersion.SupportPasscode
		};

		// Add the connection to the connections.
		this.connections.add(socket);

		// Hook the close event to the disconnect method.
		socket.once("close", () => this.connections.delete(socket));

		// Send the packet to the client.
		socket.write(packet.serialize());
	}

	/**
	 * Broadcast the packets to all connections.
	 * @param packets The packets to broadcast.
	 */
	public broadcast(...packets: Array<DebugEventPacket>): void {
		for (const connection of this.connections) {
			for (const packet of packets) {
				connection.write(packet.serialize());
			}
		}
	}

	/**
	 * Generate the packet statistics.
	 * @returns The packet statistics.
	 */
	public generatePacketStatistics(): Record<string, unknown> {
		// Get the network stats queue.
		const queue = [...this.networkStatsQueue];

		// Get the packet statistic.
		const stat = {
			name: "networking",
			children: [
				{
					name: "packets",
					children: [
						{
							name: "details",
							children: queue.map(([id, stat]) => ({
								name: `${id} (${stat.name})`,
								children: [
									{
										name: "received",
										values: [stat.received]
									},
									{
										name: "sent",
										values: [stat.sent]
									},
									{
										name: "received_bytes",
										values: [stat.received_bytes]
									},
									{
										name: "sent_bytes",
										values: [stat.sent_bytes]
									}
								]
							}))
						},
						{
							name: "received",
							values: [
								queue.reduce(
									(accumulator, [_, stat]) => accumulator + stat.received,
									0
								)
							]
						},
						{
							name: "sent",
							values: [
								queue.reduce(
									(accumulator, [_, stat]) => accumulator + stat.sent,
									0
								)
							]
						},
						{
							name: "received_bytes",
							values: [
								queue.reduce(
									(accumulator, [_, stat]) => accumulator + stat.received_bytes,
									0
								)
							]
						},
						{
							name: "sent_bytes",
							values: [
								queue.reduce(
									(accumulator, [_, stat]) => accumulator + stat.sent_bytes,
									0
								)
							]
						}
					]
				}
			]
		};

		// Clear the network stats queue.
		this.networkStatsQueue.clear();

		// Return the packet statistic.
		return stat;
	}

	/**
	 * Generate the chunk statistics.
	 * @returns The chunk statistics.
	 */
	public generateChunkStatistics(): Record<string, unknown> {
		// Get the chunk statistics.
		const chunks = this.serenity.worlds
			.getAll()
			.flatMap((world) => [...world.dimensions.values()])
			.map((dimension) => ({
				name: `${dimension.world.identifier}:${dimension.identifier}`,
				children: [
					{
						name: "loaded",
						values: [dimension.world.provider.getCachedChunkSize(dimension)]
					}
				]
			}));

		// Return the chunk statistics.
		return {
			name: "chunks",
			children: chunks as Array<Record<string, unknown>>
		};
	}

	/**
	 * Generate the memory statistics.
	 * @returns The memory statistics.
	 */
	public generateMemoryStatistics(): Record<string, unknown> {
		// get used amount of memory
		// get the free amount of memory
		const used = totalmem() - freemem();
		const free = freemem();

		// Return the memory statistics.
		return {
			name: "app_memory",
			children: [
				{
					name: "used",
					type: "bytes",
					values: [used]
				},
				{
					name: "free",
					type: "bytes",
					values: [free]
				}
			]
		};
	}

	/**
	 * Generate the JavaScript memory statistics.
	 * @returns The JavaScript memory
	 */
	public generateJavaScriptMemoryStatistics(): Record<string, unknown> {
		// get used amount of memory
		// get the allocated amount of memory
		const used = process.memoryUsage().heapUsed;
		const allocated = process.memoryUsage().heapTotal;

		// Return the memory statistics.
		return {
			name: "runtime_memory",
			children: [
				{
					name: "used",
					type: "bytes",
					values: [used]
				},
				{
					name: "allocated",
					type: "bytes",
					values: [allocated]
				}
			]
		};
	}

	/**
	 * Generate the tick statistics.
	 * @param deltaTick The delta tick
	 * @returns The tick statistics.
	 */
	public generateTickStatistics(deltaTick: number): Record<string, unknown> {
		// Return the tick statistics.
		return {
			name: "server_tick_timings",
			children: [
				{
					name: "level_tick",
					type: "microseconds",
					values: [deltaTick, this.serenity.tick] // ?? Not sure what the format is
				}
			]
		};
	}

	/**
	 * Get the entity statistics.
	 * @returns The entity
	 */
	public getEntityStatistics(): Record<string, unknown> {
		// Get the total amount of entities
		const total = this.serenity.worlds
			.getAll()
			.flatMap((world) => world.getEntities()).length;

		// Return the entity statistics.
		return {
			name: "entities",
			values: [total]
		};
	}
}

export { Debugger };
