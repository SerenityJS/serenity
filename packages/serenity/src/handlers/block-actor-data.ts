import { BlockActorDataPacket, Color } from "@serenityjs/protocol";

import { SerenityHandler } from "./serenity-handler";

import type { CompoundTag, IntTag } from "@serenityjs/nbt";
import type { NetworkSession } from "@serenityjs/network";

export class BlockActorData extends SerenityHandler {
	public static readonly packet = BlockActorDataPacket.id;

	public static handle(
		packet: BlockActorDataPacket,
		session: NetworkSession
	): void {
		// Get the player from the session
		// And check if the player is not undefined
		const player = this.serenity.getPlayer(session);
		if (!player) return;
		const {
			value: { x, y, z }
		} = packet.nbt as CompoundTag<{
			x: IntTag<number>;
			y: IntTag<number>;
			z: IntTag<number>;
		}>;

		const blockActor = player.dimension.getBlock(x.value, y.value, z.value);

		if (blockActor.hasComponent("minecraft:sign")) {
			const signComponent = blockActor.getComponent("minecraft:sign");

			signComponent.readTag(packet.nbt);
		}
	}
}
