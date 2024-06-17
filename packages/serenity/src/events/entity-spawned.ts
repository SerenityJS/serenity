import {
	DisconnectReason,
	type AddEntityPacket,
	Packet
} from "@serenityjs/protocol";
import { NetworkBound, type NetworkPacketEvent } from "@serenityjs/network";

import { EventSignal } from "./event-signal";
import { EventPriority } from "./priority";

import type { Serenity } from "../serenity";
import type { Entity, Player } from "@serenityjs/world";

/**
 * This signal is dispatched when an entity is spawned for a player, this means that this event may be dispatched multiple times depending on the amount of players.
 */
class EntitySpawnedSignal extends EventSignal {
	/**
	 * The serenity instance.
	 */
	public static serenity: Serenity;

	/**
	 * The packet of the event signal.
	 */
	public static readonly hook = Packet.AddEntity;

	/**
	 * The priority of the event signal.
	 */
	public static readonly priority = EventPriority.After;

	/**
	 * The player the entity is spawning for.
	 */
	public readonly player: Player;

	/**
	 * The entity that is spawning.
	 */
	public readonly entity: Entity;

	/**
	 * Constructs a new entity spawned signal instance.
	 * @param player The player the entity is spawning for.
	 * @param entity The entity that is spawning.
	 */
	public constructor(player: Player, entity: Entity) {
		super();
		this.player = player;
		this.entity = entity;
	}

	public static logic(data: NetworkPacketEvent<AddEntityPacket>): void {
		// Separate the data into variables.
		const { session, bound, packet } = data;

		// Also check if the packet is outgoing. Meaning the packet is being sent to the client.
		if (bound === NetworkBound.Server) return;

		// Get the player from the session.
		// If there is no player, then disconnect the session.
		const player = this.serenity.getPlayer(session);
		if (!player)
			return session.disconnect(
				"Failed to connect due to an invalid player. Please try again.",
				DisconnectReason.InvalidPlayer
			);

		// Get the entity from the packet.
		const entity = player.dimension.getEntity(packet.uniqueEntityId);

		// Check if the entity is not found.
		if (!entity)
			throw new Error(`Entity with id ${packet.uniqueEntityId} not found!`);

		// Create a new signal instance.
		const signal = new this(player, entity);

		// Return the signal.
		const value = this.serenity.emit("EntitySpawned", signal);

		// Despawn the entity for the player if the value is false.
		if (!value) entity.despawn(player);
	}
}

export { EntitySpawnedSignal };
