import { ZigZag, Bool } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { Packet as PacketId } from '../enums';
import { Vec3f, Vector3f } from '../types';

@Packet(PacketId.ChangeDimension)
class ChangeDimension extends DataPacket {
	@Serialize(ZigZag) public dimension!: number;
	@Serialize(Vector3f) public position!: Vec3f;
	@Serialize(Bool) public respawn!: boolean;
}

export { ChangeDimension };
