import type { MobEquipment, Text } from '@serenityjs/bedrock-protocol';
import { Packet } from '@serenityjs/bedrock-protocol';
import type { Serenity } from '../Serenity.js';
import { NetworkBound, type NetworkPacketEvent } from '../network/index.js';
import type { Player } from '../player/index.js';
import { HookMethod } from '../types/index.js';
import { AbstractEvent } from './AbstractEvent.js';

class PlayerSelectSlot extends AbstractEvent {
	public static serenity: Serenity;

	public static readonly hook = Packet.MobEquipment;
	public static readonly method = HookMethod.Before;

	public readonly player: Player;
	public slot: number;

	public constructor(player: Player, slot: number) {
		super();
		this.player = player;
		this.slot = slot;
	}

	public static async logic(data: NetworkPacketEvent<MobEquipment>): Promise<boolean> {
		// Separate the data into variables.
		const { session, bound, packet } = data;

		// Check if the player exists.
		if (!session.player) {
			this.serenity.logger.error(
				`Failed to find player instance for ${session.identifier.address}:${session.identifier.port}! PlayerSelectSlot.logic()`,
			);

			return false;
		}

		// Declare the player.
		const player = session.player;

		// Check if the packet is incoming. Meaning the packet is being sent to by client.
		// Return true if the packet is not incoming.
		// This will allow the packets that are outgoing to be sent to the client.
		if (bound !== NetworkBound.Server) return true;

		// Get the selected slot from the packet.
		const slot = packet.selectedSlot;

		// Construct the event.
		const event = new PlayerSelectSlot(player, slot);

		// Call the event.
		const value = this.serenity.emit('PlayerSelectSlot', event);

		// If the value is false, set the selected slot to the original slot.
		if (!value) {
			// Get the players inventory component.
			const inventory = player.getComponent('minecraft:inventory');

			// Set the selected slot.
			inventory.selectSlot(packet.selectedSlot);
		} else if (slot !== packet.selectedSlot) {
			// Get the players inventory component.
			const inventory = player.getComponent('minecraft:inventory');

			// Set the selected slot.
			inventory.selectSlot(slot);
		}

		// Reassign variables to the packet.
		packet.selectedSlot = event.slot;

		// Return the value of the event.
		// This is incase the event was cancelled,
		// so the packet handler will not be called.
		return value;
	}
}

export { PlayerSelectSlot };
