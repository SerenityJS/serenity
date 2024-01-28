import { Buffer } from 'node:buffer';

/**
 * The game packet header.
 * This is used to identify the packet as a game packet.
 */
const GAME_BYTE = Buffer.from([0xfe]);

export { GAME_BYTE };
