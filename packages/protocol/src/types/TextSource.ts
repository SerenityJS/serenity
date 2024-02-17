import type { BinaryStream, Endianness } from '@serenityjs/binarystream';
import { DataType } from '@serenityjs/raknet-protocol';
import { ChatTypes } from '../enums/index.js';

class TextSource extends DataType {
	public static override read(stream: BinaryStream, _: Endianness, type: ChatTypes): string | null {
		// Check if the type is Chat, Whisper or Announcement.
		if (type === ChatTypes.Chat || type === ChatTypes.Whisper || type === ChatTypes.Announcement) {
			// Read the string from the stream.
			return stream.readVarString();
		} else {
			// Return null.
			return null;
		}
	}

	public static override write(stream: BinaryStream, value: string, _: Endianness, type: ChatTypes): void {
		// Check if the type is Chat, Whisper or Announcement.
		if (type === ChatTypes.Chat || type === ChatTypes.Whisper || type === ChatTypes.Announcement) {
			// Write the string to the stream.
			stream.writeVarString(value);
		}
	}
}

export { TextSource };
