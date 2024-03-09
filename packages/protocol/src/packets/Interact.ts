import { Uint8, Endianness, VarLong } from '@serenityjs/binaryutils';
import { Packet, Serialize } from '@serenityjs/raknet-protocol';
import { DataPacket } from '../DataPacket.js';
import { InteractActions, Packet as PacketId } from '../enums/index.js';
import { InteractPosition, Vector3f } from '../types/index.js';

@Packet(PacketId.Interact)
class Interact extends DataPacket {
	@Serialize(Uint8) public action!: InteractActions;
	@Serialize(VarLong) public targetUniqueEntityId!: bigint;
	@Serialize(InteractPosition, Endianness.Big, 'action') public position!: Vector3f;
}

export { Interact };
