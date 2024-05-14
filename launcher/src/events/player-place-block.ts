import {
	type BlockFace,
	DisconnectReason,
	type InventoryTransactionPacket,
	ItemUseInventoryTransactionType,
	Packet,
	type Vector3f
} from "@serenityjs/protocol";
import { NetworkBound, type NetworkPacketEvent } from "@serenityjs/network";

import { EventSignal } from "./event-signal";
import { EventPriority } from "./priority";

import type { Serenity } from "../serenity";
import type { Block, Player } from "@serenityjs/world";

class PlayerPlaceBlockSignal extends EventSignal {
	/**
	 * The serenity instance.
	 */
	public static serenity: Serenity;

	/**
	 * The packet of the event signal.
	 */
	public static readonly hook = Packet.InventoryTransaction;

	/**
	 * The priority of the event signal.
	 */
	public static readonly priority = EventPriority.After;

	/**
	 * The player that placed the block.
	 */
	public readonly player: Player;

	/**
	 * The block that was placed.
	 */
	public readonly block: Block;

	/**
	 * The face of the block.
	 */
	public readonly face: BlockFace;

	/**
	 * The location of the face.
	 */
	public readonly faceLocation: Vector3f;

	/**
	 * Constructs a new player place block after signal instance.
	 * @param player The player that placed the block.
	 * @param block The block that was placed.
	 * @param face The face of the block.
	 * @param faceLocation The location of the face.
	 */
	public constructor(
		player: Player,
		block: Block,
		face: BlockFace,
		faceLocation: Vector3f
	) {
		super();
		this.player = player;
		this.block = block;
		this.face = face;
		this.faceLocation = faceLocation;
	}

	public static logic(
		data: NetworkPacketEvent<InventoryTransactionPacket>
	): boolean {
		// Separate the data into variables.
		const { session, bound, packet } = data;

		// Also check if the packet is outgoing. Meaning the packet is being sent to the client.
		if (bound !== NetworkBound.Server) return true;

		// Get the player from the session.
		// If there is no player, then disconnect the session.
		const player = this.serenity.getPlayer(session);
		if (!player) {
			session.disconnect(
				"Failed to connect due to an invalid player. Please try again.",
				DisconnectReason.InvalidPlayer
			);

			return false;
		}

		// Check if there is no transaction or item use.
		if (!packet.transaction) return true;
		if (!packet.transaction.itemUse) return true;
		if (
			packet.transaction.itemUse.type !== ItemUseInventoryTransactionType.Place
		)
			return true;

		// Separate the data into variables.
		const { face, clickPosition, blockPosition } = packet.transaction.itemUse;

		// Get the block from the player's dimension.
		const block = player.dimension
			.getBlock(blockPosition.x, blockPosition.y, blockPosition.z)
			.face(face);

		// Check if the block is air, if so, then return.
		if (block.isAir) return true;

		// Emit the signal.
		const value = this.serenity.emit(
			"PlayerPlaceBlock",
			new this(player, block, face, clickPosition)
		);

		// Check if the event was cancelled.
		if (value === false) {
			// Set the block to air.
			block.destroy();
		}

		// Return the value.
		return value;
	}
}

export { PlayerPlaceBlockSignal };
