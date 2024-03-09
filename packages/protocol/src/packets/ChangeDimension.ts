import { ZigZag, Bool } from '@serenityjs/binaryutils';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { DimensionType, Packet as PacketId } from '../enums/index.js';
import { Vector3f } from '../types/index.js';

@Packet(PacketId.ChangeDimension)
class ChangeDimension extends DataPacket {
	@Serialize(ZigZag) public dimension!: DimensionType;
	@Serialize(Vector3f) public position!: Vector3f;
	@Serialize(Bool) public respawn!: boolean;
}

export { ChangeDimension };
