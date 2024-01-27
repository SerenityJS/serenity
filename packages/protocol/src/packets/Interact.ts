import { Uint8, Endianness, VarLong } from '@serenityjs/binarystream';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket';
import { InteractActions, Packet as PacketId } from '../enums';
import { InteractPosition, Vec3f } from '../types';

@Packet(PacketId.Interact)
class Interact extends DataPacket {
	@Serialize(Uint8) public action!: InteractActions;
	@Serialize(VarLong) public targetUniqueEntityId!: bigint;
	@Serialize(InteractPosition, Endianness.Big, 'action') public position!: Vec3f;
}

export { Interact };
