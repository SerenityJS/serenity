import type { Buffer } from 'node:buffer';
import { BinaryStream } from '@serenityjs/binarystream';

/**
 * Get the packet ID from a buffer. ( VarInt )
 *
 * @param buffer
 * @returns {number}
 */
function getPacketId(buffer: Buffer): number {
	const stream = BinaryStream.fromBuffer(buffer);

	return stream.readVarInt();
}

export { getPacketId };
