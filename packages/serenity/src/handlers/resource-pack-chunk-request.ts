import {
	Packet,
	ResourcePackChunkDataPacket,
	type ResourcePackChunkRequestPacket
} from "@serenityjs/protocol";

import { ResourcePack } from "../resource-packs/resource-pack-manager";

import { SerenityHandler } from "./serenity-handler";

import type { NetworkSession } from "@serenityjs/network";

class ResourcePackChunkRequest extends SerenityHandler {
	public static packet = Packet.ResourcePackChunkRequest;

	public static handle(
		packet: ResourcePackChunkRequestPacket,
		session: NetworkSession
	): void {
		const pack = this.serenity.resourcePacks.getPack(packet.packId);

		// This should hopefully never happen
		if (!pack) {
			this.serenity.resourcePacks.logger.error(
				`Received request for unknown pack ${packet.packId}.`
			);

			return;
		}

		const chunkPacket = new ResourcePackChunkDataPacket();
		chunkPacket.packId = packet.packId;
		chunkPacket.chunkId = packet.chunkId;
		chunkPacket.byteOffset = BigInt(
			packet.chunkId * ResourcePack.MAX_CHUNK_SIZE
		);
		chunkPacket.chunkData = pack.getChunk(packet.chunkId);

		session.sendImmediate(chunkPacket);
	}
}

export { ResourcePackChunkRequest };
