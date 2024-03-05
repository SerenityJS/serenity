import { ZigZag } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { LevelEventId, Packet as PacketId } from '../enums/index.js';
import { Vector3f } from '../types/Vector3f.js';

@Packet(PacketId.LevelEvent)
class LevelEvent extends DataPacket {
	@Serialize(ZigZag) public event!: LevelEventId;
	@Serialize(Vector3f) public position!: Vector3f;
	@Serialize(ZigZag) public data!: number;
}

export { LevelEvent };
