import { ItemIdentifier } from "@serenityjs/item";
import { Gamemode, LevelEvent, LevelEventPacket } from "@serenityjs/protocol";

import { BlockStateComponent } from "./state";

import type { Player } from "../../../player";
import type { Block } from "../../../block";

class BlockGrowthComponent extends BlockStateComponent {
	public static readonly identifier = "minecraft:growth";

	public static readonly state = "growth";

	/**
	 * The current growth stage of the block.
	 */
	public stage = 0;

	public constructor(block: Block) {
		super(block, BlockGrowthComponent.identifier);

		// Get the permutation of the block
		const permutation = block.permutation;

		// Get the state of the block
		const state = permutation.state as { growth: number };

		// Set the stage of the block
		this.stage = state.growth;
	}

	/**
	 * Sets the direction of the block.
	 * @param direction The direction to set.
	 */
	public setStage(stage: number): void {
		// Set the stage of the block
		this.stage = stage;

		// Get the block type
		const type = this.block.getType();

		// Get the state of the block
		const state = this.block.permutation.state;

		// Create the state of the block
		const newState = {
			...state,
			growth: stage
		};

		// Set the direction of the block
		const permutation = type.getPermutation(newState);

		// Set the permutation of the block
		if (permutation)
			this.block.setPermutation(permutation, { clearComponents: false });
	}

	public onTick(): void {
		// Get the current tick of the world
		const currentTick = this.block.dimension.world.currentTick;

		// Check if the current tick is not divisible by 20
		// And if the stage is greater than or equal to 7
		if (currentTick % 20n !== 0n || this.stage >= 7) return;

		// Random growth has a probability of 14%
		const random = Math.floor(Math.random() * 100);

		// Check if the random number is less than 14
		if (random < 14) {
			// Increment the stage of the block
			this.setStage(this.stage + 1);
		}
	}

	public onBreak(): boolean {
		// The block is fully grown, drop the item
		if (this.stage === 7) return true;

		// Block is not fully grown, don't drop anything
		return false;
	}

	public onInteract(player: Player): void {
		// Check if the plant is fully grown
		if (this.stage === 7) return;

		// Get the player's inventory
		const inventory = player.getComponent("minecraft:inventory");

		// Get the item in the player's hand
		const item = inventory.getHeldItem();

		// Check if there is no item in the player's hand
		if (!item) return;

		// Check if the item is a bone meal
		const identifier = item.type.identifier;
		if (identifier !== ItemIdentifier.BoneMeal) return;

		// Check if the player is in creative mode
		if (player.getGamemode() === Gamemode.Creative) {
			// Set the stage of the block to 7
			this.setStage(7);
		} else {
			// Decrement the amount of bone meal in the player's hand
			item.decrement();

			// Growth is has a probability of 75%
			const random = Math.floor(Math.random() * 100);

			// Check if the random number is less than 75
			if (random < 75) {
				// Increment the stage of the block
				this.setStage(this.stage + 1);

				// Create a new LevelEventPacket
				const packet = new LevelEventPacket();

				// Set the event of the packet
				packet.event = LevelEvent.ParticleCropGrowth;
				packet.position = this.block.position;
				packet.data = this.block.permutation.network;

				// Send the packet to the dimension
				this.block.dimension.broadcast(packet);
			}
		}
	}
}

export { BlockGrowthComponent };
