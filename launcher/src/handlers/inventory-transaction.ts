import {
	BlockFace,
	ComplexInventoryTransaction,
	DisconnectReason,
	type InventoryAction,
	InventoryTransactionPacket,
	ItemUseInventoryTransactionType,
	LevelSoundEvent,
	LevelSoundEventPacket,
	Vector3f,
	type ItemUseInventoryTransaction,
	Gamemode
} from "@serenityjs/protocol";
import {
	EntityPhysicsComponent,
	ItemStack,
	type Player
} from "@serenityjs/world";

import { SerenityHandler } from "./serenity-handler";

import type { BlockPermutation } from "@serenityjs/block";
import type { NetworkSession } from "@serenityjs/network";

class InventoryTransaction extends SerenityHandler {
	public static packet = InventoryTransactionPacket.id;

	public static handle(
		packet: InventoryTransactionPacket,
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

		// Check if the packet has a transaction
		if (!packet.transaction) return;

		const type = packet.transaction.type;

		if (type === ComplexInventoryTransaction.NormalTransaction) {
			this.handleNormalTransaction(packet.transaction.actions, player);
		}

		if (packet.transaction.itemUse) {
			return this.handleItemUse(packet.transaction.itemUse, player);
		}
	}

	public static handleNormalTransaction(
		actions: Array<InventoryAction>,
		player: Player
	): void {
		// TODO: CLEANUP
		// NOTE: This implmentation is incomplete and will be updated in the future.
		// This only handles item dropping for now.
		const action = actions[0] as InventoryAction;
		const amount = action.newItem.stackSize ?? 1;

		// Get the inventory of the player
		const inventory = player.getComponent("minecraft:inventory");

		// Get the item from the slot
		const item = inventory.container.getItem(action.slot);

		// Check if the item is valid
		if (!item) return;

		// Remove the amount from the item
		item.amount -= amount;

		// Clone the itemStack, so we can drop the item
		const itemStack = ItemStack.create(item.type, amount, item.metadata);

		// Get the player's position and rotation
		const { x, y, z } = player.position;
		const { headYaw, pitch } = player.rotation;

		// Normalize the pitch & headYaw, so the entity will be spawned in the correct direction
		const headYawRad = (headYaw * Math.PI) / 180;
		const pitchRad = (pitch * Math.PI) / 180;

		// Calculate the velocity of the entity based on the player's rotation
		const velocity = new Vector3f(
			-Math.sin(headYawRad) * Math.cos(pitchRad),
			-Math.sin(pitchRad),
			Math.cos(headYawRad) * Math.cos(pitchRad)
		);

		// Spawn the entity
		const entity = player.dimension.spawnItem(itemStack, new Vector3f(x, y, z));

		// Add the physics component to the entity
		// TODO: Globalize the physics component
		new EntityPhysicsComponent(entity);

		// Set the velocity of the entity
		entity.setMotion(velocity);
	}

	public static handleItemUse(
		packet: ItemUseInventoryTransaction,
		player: Player
	): void {
		// Check if the type is to place a block
		if (packet.type === ItemUseInventoryTransactionType.Place) {
			// Get the block from the face
			const { x, y, z } = packet.blockPosition;

			// Get the block interacted with, and the block that will be updated
			const interactedBlock = player.dimension.getBlock(x, y, z);
			const updatingBlock = interactedBlock.face(packet.face);

			// Fire the onInteract method of the block components
			for (const component of interactedBlock.components.values()) {
				// Call the onInteract method.
				component.onInteract?.(player);
			}

			// Get the item thats being placed
			const inventory = player.getComponent("minecraft:inventory");
			const item = inventory.container.getItem(packet.slot);

			// Check if the item is valid and is a block
			if (!item) return;
			if (!item.type.block) return;

			// Check if the player is in survival mode
			if (player.gamemode === Gamemode.Survival) {
				// Decrease the amount of the item
				item.amount--;
			}

			// Set the permutation of the block
			updatingBlock
				.setPermutation(
					item.type.block.permutations[item.metadata] as BlockPermutation,
					player
				)
				.setDirection(
					player.getCardinalDirection(),
					packet.face !== BlockFace.Top
				);

			// Create the sound packet
			const sound = new LevelSoundEventPacket();

			// Assign the sound data
			sound.event = LevelSoundEvent.Place;
			sound.position = new Vector3f(x, y, z);
			sound.data = updatingBlock.permutation.network;
			sound.actorIdentifier = "";
			sound.isBabyMob = false;
			sound.isGlobal = true;

			// Broadcast the sound packet
			updatingBlock.dimension.broadcast(sound);
		}
	}
}

export { InventoryTransaction };
