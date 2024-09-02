import {
	AbilityIndex,
	ActionIds,
	ActorFlag,
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
import {
	ItemStack,
	ItemUseCause,
	PlayerJumpSignal,
	PlayerStartSwimmingSignal,
	PlayerStopSwimmingSignal,
	type Player
} from "@serenityjs/world";
import { type ItemIdentifier, ItemType } from "@serenityjs/item";

import { SerenityHandler } from "./serenity-handler";

import type { NetworkSession } from "@serenityjs/network";

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

			case ActionIds.Jump: {
				// Create a new PlayerJumpSignal and emit it.
				const signal = new PlayerJumpSignal(player);
				return void signal.emit();
			}

			case ActionIds.StartSprint: {
				player.isSprinting = true;
				player.setActorFlag(ActorFlag.Sprinting, true);
				break;
			}

			case ActionIds.StopSprint: {
				player.isSprinting = false;
				player.setActorFlag(ActorFlag.Sprinting, false);
				break;
			}

			case ActionIds.StartSneak: {
				player.isSneaking = true;
				player.setActorFlag(ActorFlag.Sneaking, true);
				break;
			}

			case ActionIds.StopSneak: {
				player.isSneaking = false;
				player.setActorFlag(ActorFlag.Sneaking, false);
				break;
			}

			// Check if a creative player destroys a block.
			// If so, we will handle the block destruction.
			case ActionIds.CreativePlayerDestroyBlock: {
				break;
				// this.handleCreativePlayerDestroyBlock(packet, player);
				// break;
			}

			case ActionIds.Swimming: {
				// Check if this is the first time the player is swimming.
				if (!player.isSwimming) {
					// Create a new PlayerStartSwimmingSignal and emit it.
					const signal = new PlayerStartSwimmingSignal(player);
					const value = signal.emit();

					// If the signal was cancelled, we will return.
					if (!value) return player.setActorFlag(ActorFlag.Swimming, false);

					// Set the player's swimming property to true.
					player.isSwimming = true;
					player.setActorFlag(ActorFlag.Swimming, true);
				}
				break;
			}

			case ActionIds.StopSwimming: {
				// Create a new PlayerStopSwimmingSignal and emit it.
				const signal = new PlayerStopSwimmingSignal(player);
				const value = signal.emit();

				// If the signal was cancelled, we will return.
				if (!value) return player.setActorFlag(ActorFlag.Swimming, true);

				// Set the player's swimming property to false.
				player.isSwimming = false;
				player.setActorFlag(ActorFlag.Swimming, false);
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
				const mayfly = player.getAbility(AbilityIndex.MayFly);

				// This stops horion flying exploit
				// Check if the player has the mayfly ability
				if (!mayfly) {
					// Set the player's flying ability to false
					player.setAbility(AbilityIndex.Flying, false);

					// Log a warning
					this.serenity.logger.warn(
						`${player.username} tried to fly without mayfly ability, possible exploit.`
					);
					break;
				}

				// Set the player's flying ability to true
				player.isFlying = true;
				player.setAbility(AbilityIndex.Flying, true);
				break;
			}

			case ActionIds.StopFlying: {
				// Set the player's flying ability to false
				player.isFlying = false;
				player.setAbility(AbilityIndex.Flying, false);
				break;
			}

			case ActionIds.MissedSwing: {
				player.executeMissSwing();
				break;
			}
		}
	}

	private static handleStartBreak(
		packet: PlayerActionPacket,
		player: Player
	): void {
		// Return if the player is in creative mode.
		if (player.gamemode === Gamemode.Creative) return;

		// Get the block position from the packet.
		const { x, y, z } = packet.blockPosition;

		// Set the mining position to the player.
		player.target = packet.blockPosition;

		// Calculate the break time.
		const breakTime = Math.ceil(2 * 20);

		// Create a new LevelEvent packet.
		const event = new LevelEventPacket();
		event.event = LevelEvent.StartBlockCracking;
		event.position = new Vector3f(x, y, z);
		event.data = 65_535 / breakTime;

		// Broadcast the event to the dimension.
		player.dimension.broadcast(event);

		// Trigger the onStartBreak method of the block components.
		const block = player.dimension.getBlock(packet.blockPosition);
		for (const component of block.components.values()) {
			// Trigger the onStartBreak method of the block component.
			component.onStartBreak?.(player);
		}

		// Trigger the onStartUse method of the item components.
		const inventory = player.getComponent("minecraft:inventory");
		const usingItem = inventory.container.getItem(inventory.selectedSlot);
		if (!usingItem) return;

		// Set the usingItem property of the player.
		player.usingItem = usingItem;

		// Trigger the onStartUse method of the item components.
		for (const component of usingItem.components.values()) {
			// Trigger the onStartUse method of the item component.
			component.onStartUse?.(player, ItemUseCause.Break);
		}
	}

	private static handleAbortBreak(
		packet: PlayerActionPacket,
		player: Player
	): void {
		// Get the block position from the packet.
		const { x, y, z } =
			packet.blockPosition === player.target
				? packet.blockPosition
				: (player.target ?? { x: 0, y: 0, z: 0 });

		// Create a new LevelEvent packet.
		const event = new LevelEventPacket();
		event.event = LevelEvent.StopBlockCracking;
		event.position = new Vector3f(x, y, z);
		event.data = 0;

		// Broadcast the event to the dimension.
		player.dimension.broadcast(event);

		// Trigger the onStopBreak method of the block components.
		const block = player.dimension.getBlock({ x, y, z });
		for (const component of block.components.values()) {
			// Trigger the onStopBreak method of the block component.
			component.onStopBreak?.(player);
		}

		// Trigger the onStopUse method of the item components.
		const usingItem = player.usingItem;
		if (!usingItem) return;

		// Set the usingItem property of the player.
		player.usingItem = null;

		// Trigger the onStartUse method of the item components.
		for (const component of usingItem.components.values()) {
			// Trigger the onStartUse method of the item component.
			component.onStopUse?.(player, ItemUseCause.Break);
		}
	}

	private static handleCreativePlayerDestroyBlock(
		packet: PlayerActionPacket,
		player: Player
	): void {
		// Get the block position from the packet.
		const { x, y, z } = packet.blockPosition;

		// Get the block from the dimension.
		const block = player.dimension.getBlock(packet.blockPosition);

		// Verify if the player is in creative mode.
		// If not, we will return.
		if (player.gamemode !== Gamemode.Creative) {
			// Create a new UpdateBlock packet.
			const update = new UpdateBlockPacket();
			update.networkBlockId = block.permutation.network;
			update.position = packet.blockPosition;
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
		block.destroy(player);
	}

	private static handlePredictBreak(
		packet: PlayerActionPacket,
		player: Player
	): void {
		// Get the block position from the packet.
		const { x, y, z } = packet.blockPosition;

		// Get the block from the dimension.
		const block = player.dimension.getBlock(packet.blockPosition);

		// If the player is in adventure mode, we will set the block permutation.
		// The player should not be able to break the block.
		// And also check if the player has the ability to break the block.
		const canMine = player.getAbility(AbilityIndex.Mine);
		if (player.gamemode === Gamemode.Adventure || !canMine) {
			// Set the block permutation.
			block.setPermutation(block.permutation);

			// Return.
			return;
		}

		// Emit the block break particles to the dimension.
		// Create a new LevelEvent packet.
		const event = new LevelEventPacket();
		event.event = LevelEvent.ParticlesDestroyBlock;
		event.position = new Vector3f(x, y, z);
		event.data = block.permutation.network;

		// Broadcast the event to the dimension.
		player.dimension.broadcast(event);

		// Get the permtuation of the block.
		const permutation = block.permutation;

		// Destroy the block.
		const destroyed = block.destroy(player);

		// If the block was not destroyed, we will return.
		if (!destroyed) return;

		// Check if the player is in creative mode.
		// If so, we will return.
		if (player.gamemode === Gamemode.Creative) return;

		// Exhaust the player
		player.exhaust(0.005);

		// Iterate over the block drops.
		for (const drop of permutation.type.drops) {
			// Roll the drop amount.
			const amount = drop.roll();

			// Create a new ItemStack.
			const itemType = ItemType.get(drop.type as ItemIdentifier) as ItemType;
			const itemStack = ItemStack.create(itemType, amount);
			const itemEntity = player.dimension.spawnItem(
				itemStack,
				new Vector3f(x + 0.5, y + 0.5, z + 0.5)
			);

			// Add random x & z velocity to the item entity.
			const velocity = new Vector3f(
				Math.random() * 0.1 - 0.05,
				itemEntity.velocity.y,
				Math.random() * 0.1 - 0.05
			);
			itemEntity.addMotion(velocity);
		}

		// Trigger the onUse method of the item components.
		const usingItem = player.usingItem;
		if (!usingItem) return;
		for (const component of usingItem.components.values()) {
			// Trigger the onUse method of the item component.
			component.onUse?.(player, ItemUseCause.Break);
		}
	}

	private static handleContinueBreak(
		packet: PlayerActionPacket,
		player: Player
	): void {
		// Check if the player was already mining.
		// If so, stop the mining.
		if (player.target) {
			// Create a new LevelEvent packet.
			const event = new LevelEventPacket();

			// Set the event to stop the block break.
			event.event = LevelEvent.StopBlockCracking;
			event.position = new Vector3f(
				player.target.x,
				player.target.y,
				player.target.z
			);
			event.data = 0;

			// Broadcast the event to the dimension.
			player.dimension.broadcast(event);
		}

		// Set the mining position to the player.
		player.target = packet.blockPosition;

		// TODO: Calculate the break time based on hardness
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
		packet: PlayerActionPacket,
		player: Player
	): void {
		// Get the players inventory component
		const inventory = player.getComponent("minecraft:inventory");

		// Get the item from the inventory, and set the usingItem property of the player.
		const item = inventory.container.getItem(inventory.selectedSlot);
		player.usingItem = item;

		// Trigger the onStartUse method of the item components.
		if (!item) return;
		for (const component of item.components.values()) {
			// Trigger the onStartUse method of the item component.
			component.onStartUse?.(player, ItemUseCause.Place);
		}
	}

	private static handleStopItemUseOn(
		packet: PlayerActionPacket,
		player: Player
	): void {
		// Trigger the onStopUse method of the item components.
		if (!player.usingItem) return;
		for (const component of player.usingItem.components.values()) {
			// Trigger the onStopUse method of the item component.
			component.onStopUse?.(player, ItemUseCause.Place);
		}

		// Update the player's usingItem property.
		player.usingItem = null;
	}
}

export { PlayerAction };
