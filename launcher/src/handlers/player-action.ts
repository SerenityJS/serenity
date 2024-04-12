import {
	ActionIds,
	DisconnectReason,
	Gamemode,
	LevelEvent,
	LevelEventPacket,
	PlayerActionPacket,
	UpdateBlockFlagsType,
	UpdateBlockLayerType,
	UpdateBlockPacket,
	Vector3f
} from "@serenityjs/protocol";

import { SerenityHandler } from "./serenity-handler";

import type { NetworkSession } from "@serenityjs/network";
import type { Player } from "@serenityjs/world";

class PlayerAction extends SerenityHandler {
	public static readonly packet = PlayerActionPacket.id;

	public static handle(
		packet: PlayerActionPacket,
		session: NetworkSession
	): void {
		// Get the player from the session
		// If there is no player, then disconnect the session.
		const player = this.serenity.getPlayer(session);
		if (!player)
			return session.disconnect(
				"Failed to connect due to an invalid player. Please try again.",
				DisconnectReason.InvalidPlayer
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

			case ActionIds.StartItemUseOn: {
				this.handleStartItemUseOn(packet, player);
				break;
			}

			case ActionIds.StopItemUseOn: {
				this.handleStopItemUseOn(packet, player);
				break;
			}

			case ActionIds.StartFlying: {
				// Get the players mayfly component
				const mayfly = player.getComponent("minecraft:ability.may_fly");

				// Get the player's flying ability
				const flying = player.getComponent("minecraft:ability.flying");

				// This stops horion flying exploit
				// Check if the player has the mayfly ability
				if (!mayfly.currentValue) {
					// Set the player's flying ability to false
					flying.setCurrentValue(false);
					break;
				}

				// Set the player's flying ability to true
				flying.setCurrentValue(true);
				break;
			}

			case ActionIds.StopFlying: {
				// Get the player's flying ability
				const flying = player.getComponent("minecraft:ability.flying");

				// Set the player's flying ability to false
				flying.setCurrentValue(false);
			}
		}
	}

	private static handleStartBreak(
		packet: PlayerActionPacket,
		player: Player
	): void {
		// Return if the player is in creative mode.
		if (Gamemode.Creative === 1) return;

		// Get the block position from the packet.
		const { x, y, z } = packet.blockPosition;

		// Set the mining position to the player.
		player.mining = { x, y, z };

		// Calculate the break time.
		const breakTime = Math.ceil(2 * 20);

		// Create a new LevelEvent packet.
		const event = new LevelEventPacket();
		event.event = LevelEvent.StartBlockCracking;
		event.position = new Vector3f(x, y, z);
		event.data = 65_535 / breakTime;

		// Broadcast the event to the dimension.
		player.dimension.broadcast(event);
	}

	private static handleAbortBreak(
		packet: PlayerActionPacket,
		player: Player
	): void {
		// Get the block position from the packet.
		const { x, y, z } =
			packet.blockPosition === player.mining
				? packet.blockPosition
				: player.mining ?? { x: 0, y: 0, z: 0 };

		// Create a new LevelEvent packet.
		const event = new LevelEventPacket();
		event.event = LevelEvent.StopBlockCracking;
		event.position = new Vector3f(x, y, z);
		event.data = 0;

		// Broadcast the event to the dimension.
		player.dimension.broadcast(event);
	}

	private static handleCreativePlayerDestroyBlock(
		packet: PlayerActionPacket,
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
			const update = new UpdateBlockPacket();
			update.networkBlockId = block.permutation.network;
			update.position = { x, y, z };
			update.flags = UpdateBlockFlagsType.Network;
			update.layer = UpdateBlockLayerType.Normal;

			// Send the update to the player.
			return player.session.send(update);
		}

		// Create a new LevelEvent packet.
		const event = new LevelEventPacket();

		// Set the event to destroy the block.
		event.event = LevelEvent.ParticlesDestroyBlock;
		event.position = new Vector3f(x, y, z);
		event.data = block.permutation.network;

		// Broadcast the event to the dimension.
		player.dimension.broadcast(event);

		// Destroy the block.
		block.destroy();
	}

	private static handlePredictBreak(
		packet: PlayerActionPacket,
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
		const event = new LevelEventPacket();
		event.event = LevelEvent.ParticlesDestroyBlock;
		event.position = new Vector3f(x, y, z);
		event.data = block.permutation.network;

		// Broadcast the event to the dimension.
		player.dimension.broadcast(event);

		// Destroy the block.
		block.destroy();
	}

	private static handleContinueBreak(
		packet: PlayerActionPacket,
		player: Player
	): void {
		// Check if the player was already mining.
		// If so, stop the mining.
		if (player.mining) {
			// Create a new LevelEvent packet.
			const event = new LevelEventPacket();

			// Set the event to stop the block break.
			event.event = LevelEvent.StopBlockCracking;
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

		// Calculate the break time.
		const breakTime = Math.ceil(2 * 20);

		// Create a new LevelEvent packet.
		const event = new LevelEventPacket();
		event.event = LevelEvent.StartBlockCracking;
		event.position = new Vector3f(
			packet.blockPosition.x,
			packet.blockPosition.y,
			packet.blockPosition.z
		);
		event.data = 65_535 / breakTime;

		// Broadcast the event to the dimension.
		player.dimension.broadcast(event);
	}

	private static handleStartItemUseOn(
		_packet: PlayerActionPacket,
		_player: Player
	): void {}

	private static handleStopItemUseOn(
		_packet: PlayerActionPacket,
		_player: Player
	): void {
		// // Get the inventory component from the player.
		// const inventory = player.getComponent("minecraft:inventory");
		// // Get the held item from the inventory.
		// const item = inventory.container.getItem(inventory.selectedSlot);
		// // Check if the it is has a block permutation.
		// // If so, we will place the block.
		// // If not, we will return for now.
		// const permutation = item?.type.block?.getPermutation();
		// if (!permutation) return;
		// // Get the block position from the packet.
		// const { x, y, z } = packet.blockPosition;
		// const sound = new LevelSoundEventPacket();
		// sound.event = LevelSoundEvent.Place;
		// sound.position = new Vector3f(x, y, z);
		// sound.data = permutation.network;
		// sound.actorIdentifier = "";
		// sound.isBabyMob = false;
		// sound.isGlobal = true;
		// player.dimension.broadcastImmediate(sound);
		// // Set the block permutation to the dimension.
		// player.dimension.getBlock(x, y, z).setPermutation(permutation);
	}
}

export { PlayerAction };
