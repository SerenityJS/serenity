import {
	type ContainerOpenPacket,
	ContainerType,
	Packet
} from "@serenityjs/protocol";
import { NetworkBound, type NetworkPacketEvent } from "@serenityjs/network";

import { EventSignal } from "./event-signal";
import { EventPriority } from "./priority";

import type { Serenity } from "../serenity";
import type { Container, Player } from "@serenityjs/world";

class PlayerContainerOpenSignal extends EventSignal {
	/**
	 * The serenity instance.
	 */
	public static serenity: Serenity;

	/**
	 * The packet of the event signal.
	 */
	public static readonly hook = Packet.ContainerOpen;

	/**
	 * The priority of the event signal.
	 */
	public static readonly priority = EventPriority.Before;

	/**
	 * The player that broke the block.
	 */
	public readonly player: Player;

	/**
	 * The block that was broken.
	 */
	public readonly container: Container;

	public readonly type: ContainerType;

	/**
	 * Constructs a new player container open signal.
	 * @param player The player that opened the container.
	 * @param block The container that was opened.
	 * @param type The type of the container. (Block, Entity, etc.)
	 */
	public constructor(
		player: Player,
		container: Container,
		type: ContainerType
	) {
		super();
		this.player = player;
		this.container = container;
		this.type = type;
	}

	public static logic(data: NetworkPacketEvent<ContainerOpenPacket>): boolean {
		// Separate the data into variables.
		const { session, bound, packet } = data;

		// Also check if the packet is outgoing. Meaning the packet is being sent to the client.
		if (bound === NetworkBound.Server) return true;

		// Get the player from the session.
		const player = this.serenity.getPlayer(session);

		// If the player is not found, return false.
		if (!player) return false;

		// Check if the container is a entity or block container.
		if (packet.type === ContainerType.Container && packet.uniqueId === -1n) {
			// Get the position of the block.
			const { x, y, z } = packet.position;

			// Get the block from the world.
			const block = player.dimension.getBlock(x, y, z);

			// Get the container of the block.
			const { container } = block.getComponent("minecraft:inventory");

			// Create a new signal.
			const signal = new this(player, container, container.type);

			// Emit the signal.
			const value = this.serenity.emit("PlayerContainerOpen", signal);

			// Check if the event was cancelled.
			return value;
		} else {
			// Get the entity from the world.
			const entity = player.dimension.getEntity(packet.uniqueId);
			if (!entity) return false;

			// Get the container of the entity.
			const { container } = entity.getComponent("minecraft:inventory");

			// Create a new signal.
			const signal = new this(player, container, container.type);

			// Emit the signal.
			const value = this.serenity.emit("PlayerContainerOpen", signal);

			// Check if the event was cancelled.
			return value;
		}
	}
}

export { PlayerContainerOpenSignal };
