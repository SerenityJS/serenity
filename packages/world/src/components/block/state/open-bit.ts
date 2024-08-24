import {
	LevelSoundEvent,
	LevelSoundEventPacket,
	Vector3f
} from "@serenityjs/protocol";

import { PlayerOpenDoorSignal } from "../../../events";

import { BlockStateComponent } from "./state";

import type { Player } from "../../../player";
import type { Block } from "../../../block";

class BlockOpenBitComponent extends BlockStateComponent {
	public static readonly identifier = "open_bit";

	public static readonly state = this.identifier;

	public constructor(block: Block) {
		super(block, BlockOpenBitComponent.identifier);
	}

	public onInteract(player: Player): void {
		// Get the state of the block
		const state = this.block.permutation.state as Record<string, unknown>;

		// Get the open bit of the block
		const openBit = state.open_bit as boolean;

		// Create the player open door signal
		const signal = new PlayerOpenDoorSignal(
			this.block,
			player,
			openBit,
			!openBit
		);

		// Emit the signal to the dimension
		const value = signal.emit();

		// Check if the signal was cancelled, reset the block state
		if (value === false) return this.setBit(openBit, true);

		// Set the bit of the block
		this.setBit(!openBit);
	}

	/**
	 * Sets the direction of the block.
	 * @param direction The direction to set.
	 */
	public setBit(open: boolean, silent = false): void {
		// Get the block type
		const type = this.block.getType();

		// Get the state of the block
		const state = this.block.permutation.state;

		// Create the state of the block
		const newState = {
			...state,
			open_bit: open
		};

		// Get the permutation of the block
		const permutation = type.getPermutation(newState);

		// Set the permutation of the block
		if (permutation)
			this.block.setPermutation(permutation, { clearComponents: false });

		// Check if the block is silent
		if (silent) return;

		// Get the position of the block and the identifier
		const { x, y, z } = this.block.position;
		const identifier = this.block.getType().identifier;

		// Create the level sound event packet
		const packet = new LevelSoundEventPacket();
		packet.data = this.block.permutation.network;
		packet.event = open ? LevelSoundEvent.DoorOpen : LevelSoundEvent.DoorClose;
		packet.position = new Vector3f(x, y, z);
		packet.actorIdentifier = String();
		packet.isBabyMob = false;
		packet.isGlobal = true;

		// Check if the block is a trapdoor
		if (identifier.includes("trapdoor")) {
			packet.event = open
				? LevelSoundEvent.TrapdoorOpen
				: LevelSoundEvent.TrapdoorClose;
		}

		// Check if the block is a fence gate
		if (identifier.includes("fence_gate")) {
			packet.event = open
				? LevelSoundEvent.FenceGateOpen
				: LevelSoundEvent.FenceGateClose;
		}

		// Send the packet to the dimension
		this.block.dimension.broadcast(packet);
	}
}

export { BlockOpenBitComponent };
