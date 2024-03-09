import type { Buffer } from 'node:buffer';
import { BinaryStream } from '@serenityjs/binaryutils';

class Framer {
	public static unframe(buffer: Buffer): Buffer[] {
		const stream = new BinaryStream(buffer);
		const frames: Buffer[] = [];

		do {
			const length = stream.readVarInt();
			const buffer = stream.readBuffer(length);

			frames.push(buffer);
		} while (!stream.cursorAtEnd());

		return frames;
	}

	public static frame(...buffers: Buffer[]): Buffer {
		const stream = new BinaryStream();

		for (const buffer of buffers) {
			stream.writeVarInt(buffer.length);
			stream.writeBuffer(buffer);
		}

		return stream.getBuffer();
	}
}

export { Framer };
