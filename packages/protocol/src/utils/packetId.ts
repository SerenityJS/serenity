import type { Buffer } from 'node:buffer';
import { BinaryStream } from '@serenityjs/binaryutils';
import type { Packet } from '../enums/index.js';

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
