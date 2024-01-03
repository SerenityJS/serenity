import type { Buffer } from 'node:buffer';
import { BinaryStream } from '@serenityjs/binarystream';
import type { Packet } from '../enums';

/**
 * Get the packet ID from a buffer. ( VarInt )
 *
 * @param buffer
 * @returns {number}
 */
function getPacketId(buffer: Buffer): Packet {
	const stream = BinaryStream.fromBuffer(buffer);

	return stream.readVarInt();
}

export { getPacketId };
