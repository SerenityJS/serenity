import {
	AbilityIndex,
	DisconnectReason,
	Gamemode,
	LevelEvent,
	LevelEventPacket,
	PlayerActionType,
	PlayerAuthInputPacket,
	Vector3f,
	type PlayerBlockActionData
} from "@serenityjs/protocol";
import {
	ItemUseCause,
	PlayerStartBreakBlockSignal,
	type Player
} from "@serenityjs/world";

import { SerenityHandler } from "./serenity-handler";

import type { NetworkSession } from "@serenityjs/network";

class PlayerAuthInput extends SerenityHandler {
	public static packet = PlayerAuthInputPacket.id;

	public static handle(
		packet: PlayerAuthInputPacket,
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

		// Set the player's position
		player.position.x = packet.position.x;
		player.position.y = packet.position.y;
		player.position.z = packet.position.z;

		// Set the player's rotation
		player.rotation.pitch = packet.rotation.x;
		player.rotation.yaw = packet.rotation.y;
		player.rotation.headYaw = packet.headYaw;

		// if (packet.inputData.hasFlag(InputData.PerformItemInteraction)) {
		// 	console.log("Item interaction");
		// }

		// if (packet.inputData.hasFlag(InputData.PerformItemStackRequest)) {
		// 	console.log("Item stack request");
		// }

		// Check if the packet has block actions
		if (packet.blockActions)
			this.handleBlockActions(player, packet.blockActions.actions);
	}

	public static handleBlockActions(
		player: Player,
		actions: Array<PlayerBlockActionData>
	): void {
		// Loop through the actions
		for (const action of actions) {
			// Check the action type
			switch (action.action) {
				case PlayerActionType.StartDestroyBlock: {
					this.handleStartDestroyBlock(player, action);
					break;
				}

				case PlayerActionType.AbortDestroyBlock: {
					this.handleAbortDestroyBlock(player, action);
					break;
				}

				case PlayerActionType.PredictDestroyBlock: {
					this.handlePredictDestroyBlock(player, action);
					break;
				}

				case PlayerActionType.ContinueDestroyBlock: {
					this.handleContinueDestroyBlock(player, action);
					break;
				}
			}
		}
	}

	public static handleStartDestroyBlock(
		player: Player,
		action: PlayerBlockActionData
	): void {
		// Return if the player is in creative mode.
		if (player.gamemode === Gamemode.Creative) return;

		// Get the block position from the packet.
		const { x, y, z } = action.position;

		// Get the block from the dimension.
		const block = player.dimension.getBlock(action.position);

		// Create a new PlayerStartBreakBlockSignal and emit it.
		const signal = new PlayerStartBreakBlockSignal(block, player);

		// Emit the signal.
		const value = signal.emit();

		// If the signal was cancelled, we will return.
		if (!value) return;

		// Set the mining position to the player.
		player.target = action.position;

		// Calculate the break time.
		const breakTime = block.getBreakTime();

		// Create a new LevelEvent packet.
		const event = new LevelEventPacket();
		event.event = LevelEvent.StartBlockCracking;
		event.position = new Vector3f(x, y, z);
		event.data = 65_535 / breakTime;

		// Broadcast the event to the dimension.
		player.dimension.broadcast(event);

		// Trigger the onStartBreak method of the block components.
		for (const component of block.components.values()) {
			// Trigger the onStartBreak method of the block component.
			component.onStartBreak?.(player);
		}

		// Check if the player has the instant build ability.
		if (player.getAbility(AbilityIndex.InstantBuild) === true)
			block.destroy({ player });

		// Trigger the onStartUse method of the item components.
		const inventory = player.getComponent("minecraft:inventory");
		const usingItem = inventory.container.getItem(inventory.selectedSlot);
		if (!usingItem) return;

		// Set the usingItem property of the player.
		player.usingItem = usingItem;

		// Trigger the onStartUse method of the item components.
		for (const component of usingItem.components.values()) {
			// Get the item use cause.
			const cause = ItemUseCause.Break;

			// Trigger the onStartUse method of the item component.
			component.onStartUse?.({ player, cause });
		}
	}

	public static handleAbortDestroyBlock(
		player: Player,
		action: PlayerBlockActionData
	): void {
		// Get the block position from the packet.
		const { x, y, z } =
			action.position === player.target
				? action.position
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
			// Get the item use cause.
			const cause = ItemUseCause.Break;

			// Trigger the onStartUse method of the item component.
			component.onStopUse?.({ player, cause });
		}
	}

	public static handlePredictDestroyBlock(
		player: Player,
		action: PlayerBlockActionData
	): void {
		// Get the gamemode of the player.
		const gamemode = player.getGamemode();

		// Get the block from the dimension.
		const block = player.dimension.getBlock(action.position);

		// Check if the player has a target.
		if (!player.target && gamemode !== Gamemode.Creative)
			return void block.setPermutation(block.permutation);

		// Check if the target matches the block position.
		if (
			player.target &&
			!player.target.equals(action.position) &&
			gamemode !== Gamemode.Creative
		)
			return void block.setPermutation(block.permutation);

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

		// Destroy the block.
		const destroyed = block.destroy({ player });

		// If the block was not destroyed, we will return.
		if (!destroyed) return;

		// Check if the player is in creative mode.
		// If so, we will return.
		if (player.gamemode === Gamemode.Creative) return;

		// Exhaust the player
		player.exhaust(0.005);

		// Trigger the onUse method of the item components.
		const usingItem = player.usingItem;
		if (!usingItem) return;
		for (const component of usingItem.components.values()) {
			// Get the item use cause.
			const cause = ItemUseCause.Break;

			// Trigger the onUse method of the item component.
			component.onUse?.({ player, cause });
		}

		// Set the target to null.
		player.target = null;
	}

	public static handleContinueDestroyBlock(
		player: Player,
		action: PlayerBlockActionData
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
		player.target = action.position;

		const block = player.dimension.getBlock(action.position);

		// TODO: Calculate the break time based on hardness
		const breakTime = block.getBreakTime();

		// Create a new LevelEvent packet.
		const event = new LevelEventPacket();
		event.event = LevelEvent.StartBlockCracking;
		event.position = new Vector3f(
			action.position.x,
			action.position.y,
			action.position.z
		);
		event.data = 65_535 / breakTime;

		// Broadcast the event to the dimension.
		player.dimension.broadcast(event);

		// Check if the player has the instant build ability.
		if (player.getAbility(AbilityIndex.InstantBuild) === true)
			block.destroy({ player });
	}
}

export { PlayerAuthInput };
