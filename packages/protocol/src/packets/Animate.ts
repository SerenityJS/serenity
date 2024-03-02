import { VarLong, ZigZag } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { AnimateId, Packet as PacketId } from '../enums/index.js';
import { AnimateAction } from '../types/AnimateAction.js';

@Packet(PacketId.Animate)
class Animate extends DataPacket {
	@Serialize(ZigZag) public id!: AnimateId;
	@Serialize(VarLong) public runtimeEntityId!: bigint;
	@Serialize(AnimateAction) public boatRowingTime!: number | null;
}

export { Animate };
