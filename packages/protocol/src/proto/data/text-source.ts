import { DataType } from "@serenityjs/raknet";

import { ChatTypes } from "../../enums";

import type { BinaryStream, Endianness } from "@serenityjs/binaryutils";

class TextSource extends DataType {
	public static override read(
		stream: BinaryStream,
		_: Endianness,
		type: ChatTypes
	): string | null {
		// Check if the type is Chat, Whisper or Announcement.
		return type === ChatTypes.Chat ||
			type === ChatTypes.Whisper ||
			type === ChatTypes.Announcement
			? stream.readVarString()
			: null;
	}

	public static override write(
		stream: BinaryStream,
		value: string,
		_: Endianness,
		type: ChatTypes
	): void {
		// Check if the type is Chat, Whisper or Announcement.
		if (
			type === ChatTypes.Chat ||
			type === ChatTypes.Whisper ||
			type === ChatTypes.Announcement
		) {
			// Write the string to the stream.
			stream.writeVarString(value);
		}
	}
}

export { TextSource };
