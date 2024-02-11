import { ZigZag, Bool } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { DimensionType, Packet as PacketId } from '../enums';
import { Vector3f } from '../types';

@Packet(PacketId.ChangeDimension)
class ChangeDimension extends DataPacket {
	@Serialize(ZigZag) public dimension!: DimensionType;
	@Serialize(Vector3f) public position!: Vector3f;
	@Serialize(Bool) public respawn!: boolean;
}

export { ChangeDimension };
