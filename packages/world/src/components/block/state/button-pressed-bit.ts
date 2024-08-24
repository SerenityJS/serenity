import {
	BlockCoordinates,
	LevelSoundEvent,
	LevelSoundEventPacket
} from "@serenityjs/protocol";

import { PlayerButtonPushSignal } from "../../../events";

import { BlockStateComponent } from "./state";

import type { Player } from "../../../player";
import type { Block } from "../../../block";

class BlockButtonPressedBitComponent extends BlockStateComponent {
	public static readonly identifier = "minecraft:button_pressed_bit";

	public static readonly state = "button_pressed_bit";

	/**
	 * The tick when the button will be released.
	 */
	public releaseTick: bigint = 0n;

	public constructor(block: Block) {
		super(block, BlockButtonPressedBitComponent.identifier);
	}

	public onInteract(player: Player): void {
		// Check if the block is already pressed
		if (this.releaseTick !== 0n) return;

		// Calculate the tick when the button will be released
		let releaseTick = this.block.dimension.world.currentTick + 40n;

		// Create the player button push signal
		const signal = new PlayerButtonPushSignal(this.block, player, releaseTick);

		// Emit the signal to the dimension
		const value = signal.emit();

		// Check if the signal was cancelleds
		if (!value) return;

		// Update the release tick from the signal
		releaseTick = signal.releaseTick;

		// Set the block to be pressed
		this.setPressed(true);

		// Set the release tick
		this.releaseTick = releaseTick;
	}

	public onTick(): void {
		// Check if the block isn't pressed
		if (this.releaseTick === 0n) return;

		// Check if the block should be release
		if (this.releaseTick <= this.block.dimension.world.currentTick) {
			// Set the block to be released
			this.setPressed(false);

			// Reset the release tick
			this.releaseTick = 0n;
		}
	}

	/**
	 * Sets pressed state of the block.
	 * @param pressed The pressed state of the block.
	 */
	public setPressed(pressed: boolean, silent = false): void {
		// Get the block type
		const type = this.block.getType();

		// Get the state of the block
		const state = this.block.permutation.state;

		// Create the state of the block
		const newState = {
			...state,
			button_pressed_bit: pressed
		};

		// Set the direction of the block
		const permutation = type.getPermutation(newState);

		// Set the permutation of the block
		if (permutation)
			this.block.setPermutation(permutation, { clearComponents: false });

		// Check if the update is silent
		if (silent) return;

		// Create a new LevelSoundEventPacket
		const sound = new LevelSoundEventPacket();
		sound.data = this.block.permutation.network;
		sound.event = pressed
			? LevelSoundEvent.ButtonClickOn
			: LevelSoundEvent.ButtonClickOff;
		sound.position = BlockCoordinates.toVector3f(this.block.position);
		sound.actorIdentifier = String();
		sound.isBabyMob = false;
		sound.isGlobal = true;

		// Broadcast the sound packet
		this.block.dimension.broadcast(sound);
	}
}

export { BlockButtonPressedBitComponent };
