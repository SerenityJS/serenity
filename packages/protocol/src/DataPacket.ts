import type { Buffer } from 'node:buffer';
import { VarInt } from '@serenityjs/binarystream';
import { BasePacket } from '@serenityjs/raknet-protocol';
import type { Packet } from './enums/index.js';

class DataPacket extends BasePacket {
	public static override readonly ID: Packet;
	public static override readonly ID_TYPE = VarInt;

	public override serialize(): Buffer {
		throw new Error('DataPacket.serialize() is not implemented');
	}

	public override deserialize(): this {
		throw new Error('DataPacket.deserialize() is not implemented');
	}
}

export { DataPacket };
