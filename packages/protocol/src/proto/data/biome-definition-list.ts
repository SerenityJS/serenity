import { Proto } from "@serenityjs/raknet";

import { Packet } from "../../enums";

import { DataPacket } from "./data-packet";

import type { Buffer } from "node:buffer";

@Proto(Packet.BiomeDefinitionList)
class BiomeDefinitionListPacket extends DataPacket {
	public biomes!: Buffer;

	public override serialize(): Buffer {
		this.writeVarInt(Packet.BiomeDefinitionList);
		this.writeBuffer(this.biomes);

		return this.getBuffer();
	}

	public override deserialize(): this {
		this.readVarInt();
		this.biomes = this.readRemainingBuffer();

		return this;
	}
}

export { BiomeDefinitionListPacket };
