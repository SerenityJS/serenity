import {
	PlayerAction,
	DisconnectReason,
	ActionIds,
	Gamemode,
	UpdateBlock,
	UpdateBlockFlagsType,
	UpdateBlockLayerType,
	LevelEvent,
	LevelEventId,
	Vector3f
} from "@serenityjs/protocol";

import { Item, type Player } from "../..";

import { NetworkHandler } from "./network-handler";

import type { NetworkSession } from "../session";
import type { Packet } from "@serenityjs/protocol";

class PlayerActionHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet: Packet = PlayerAction.id;

	public static override handle(
		packet: PlayerAction,
		session: NetworkSession
	): void {
		// Get the player from the session.
		// And check if the player is null or undefined.
		const player = session.player;

		// Disconnect the player if they are null or undefined.
		if (!player)
			return session.disconnect(
				"Failed to get player instance.",
				DisconnectReason.MissingClient
			);

		switch (packet.action) {
			default: {
				this.serenity.logger.debug(
					`Unhandled PlayerAction: ${ActionIds[packet.action]}`
				);
				break;
			}

			// Handles when a player breaks a block in survival mode.
			case ActionIds.StartBreak: {
				this.handleStartBreak(packet, player);
				break;
			}

			case ActionIds.AbortBreak: {
				this.handleAbortBreak(packet, player);
				break;
			}

			// Check if a creative player destroys a block.
			// If so, we will handle the block destruction.
			case ActionIds.CreativePlayerDestroyBlock: {
				this.handleCreativePlayerDestroyBlock(packet, player);
				break;
			}

			case ActionIds.PredictBreak: {
				this.handlePredictBreak(packet, player);
				break;
			}

			case ActionIds.ContinueBreak: {
				this.handleContinueBreak(packet, player);
				break;
			}

			case ActionIds.StopItemUseOn: {
				this.handleStopItemUseOn(packet, player);
				break;
			}
		}
	}

	private static handleStartBreak(packet: PlayerAction, player: Player): void {
		// Return if the player is in creative mode.
		if (player.gamemode === Gamemode.Creative) return;

		// Get the block position from the packet.
		const { x, y, z } = packet.blockPosition;

		// Set the mining position to the player.
		player.mining = { x, y, z };

		// Get the block from the dimension.
		const block = player.dimension.getBlock(x, y, z);

		// Get the block hardness.
		const hardness = block.permutation.type.behavior.hardness;

		// Calculate the break time.
		const breakTime = Math.ceil(hardness * 20);

		// Create a new LevelEvent packet.
		const event = new LevelEvent();
		event.event = LevelEventId.BlockStartBreak;
		event.position = new Vector3f(x, y, z);
		event.data = 65_535 / breakTime;

		// Broadcast the event to the dimension.
		player.dimension.broadcast(event);
	}

	private static handleAbortBreak(packet: PlayerAction, player: Player): void {
		// Get the block position from the packet.
		const { x, y, z } =
			packet.blockPosition === player.mining
				? packet.blockPosition
				: player.mining ?? { x: 0, y: 0, z: 0 };

		// Create a new LevelEvent packet.
		const event = new LevelEvent();
		event.event = LevelEventId.BlockStopBreak;
		event.position = new Vector3f(x, y, z);
		event.data = 0;

		// Broadcast the event to the dimension.
		player.dimension.broadcast(event);
	}

	private static handleCreativePlayerDestroyBlock(
		packet: PlayerAction,
		player: Player
	): void {
		// Get the block position from the packet.
		const { x, y, z } = packet.blockPosition;

		// Get the block from the dimension.
		const block = player.dimension.getBlock(x, y, z);

		// Verify if the player is in creative mode.
		// If not, we will return.
		if (player.gamemode !== Gamemode.Creative) {
			// Create a new UpdateBlock packet.
			const update = new UpdateBlock();
			update.blockRuntimeId = block.permutation.getRuntimeId();
			update.position = { x, y, z };
			update.flags = UpdateBlockFlagsType.Network;
			update.layer = UpdateBlockLayerType.Normal;

			// Send the update to the player.
			return player.session.send(update);
		}

		// Send the block break particles to the dimension.
		// Create a new LevelEvent packet.
		const event = new LevelEvent();
		event.event = LevelEventId.ParticleDestroyBlockNoSound;
		event.position = new Vector3f(x, y, z);
		event.data = block.permutation.getRuntimeId();

		// Broadcast the event to the dimension.
		player.dimension.broadcast(event);

		// Destroy the block.
		block.destroy();
	}

	private static handlePredictBreak(
		packet: PlayerAction,
		player: Player
	): void {
		// Check if the player is in creative mode.
		// If so, we will return.
		if (player.gamemode === Gamemode.Creative) return;

		// Get the block position from the packet.
		const { x, y, z } = packet.blockPosition;

		// Get the block from the dimension.
		const block = player.dimension.getBlock(x, y, z);

		// Emit the block break particles to the dimension.
		// Create a new LevelEvent packet.
		const event = new LevelEvent();
		event.event = LevelEventId.ParticleDestroyBlockNoSound;
		event.position = new Vector3f(x, y, z);
		event.data = block.permutation.getRuntimeId();

		// Broadcast the event to the dimension.
		player.dimension.broadcast(event);

		// Destroy the block.
		block.destroy();

		// TEMP: Add the item to the players inventory.
		// Get the players inventory component.
		const inventory = player.getComponent("minecraft:inventory");

		// Get the item type from the block.
		const itemType = player.dimension.world.items.resolveType(
			block.permutation.type.identifier
		);

		// Check if the item type is null.
		if (!itemType) return;

		// Create a new item instance.
		const item = new Item(itemType, 1);

		// Add the item to the players inventory.
		inventory.container.addItem(item);
	}

	private static handleContinueBreak(
		packet: PlayerAction,
		player: Player
	): void {
		// Check if the player was already mining.
		// If so, stop the mining.
		if (player.mining) {
			// Create a new LevelEvent packet.
			const event = new LevelEvent();

			// Set the event to stop the block break.
			event.event = LevelEventId.BlockStopBreak;
			event.position = new Vector3f(
				player.mining.x,
				player.mining.y,
				player.mining.z
			);
			event.data = 0;

			// Broadcast the event to the dimension.
			player.dimension.broadcast(event);
		}

		// Set the mining position to the player.
		player.mining = packet.blockPosition;

		// Get the block from the dimension.
		const block = player.dimension.getBlock(
			packet.blockPosition.x,
			packet.blockPosition.y,
			packet.blockPosition.z
		);

		// Get the block hardness.
		const hardness = block.permutation.type.behavior.hardness;

		// Calculate the break time.
		const breakTime = Math.ceil(hardness * 20);

		// Create a new LevelEvent packet.
		const event = new LevelEvent();
		event.event = LevelEventId.BlockStartBreak;
		event.position = new Vector3f(
			packet.blockPosition.x,
			packet.blockPosition.y,
			packet.blockPosition.z
		);
		event.data = 65_535 / breakTime;

		// Broadcast the event to the dimension.
		player.dimension.broadcast(event);
	}

	private static handleStopItemUseOn(
		packet: PlayerAction,
		player: Player
	): void {
		// Get the inventory component from the player.
		const inventory = player.getComponent("minecraft:inventory");

		// Get the held item from the inventory.
		const item = inventory.container.getItem(inventory.selectedSlot);

		// Check if the it is has a block permutation.
		// If so, we will place the block.
		// If not, we will return for now.
		const permutation = item?.type.permutation;
		if (!permutation) return;

		// Get the block position from the packet.
		const { x, y, z } = packet.blockPosition;

		// Set the block permutation to the dimension.
		player.dimension.setPermutation(x, y, z, permutation);
	}
}

export { PlayerActionHandler };
