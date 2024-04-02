import { DataType } from "@serenityjs/raknet";

import { TextPacketType } from "../../enums";

import type { BinaryStream, Endianness } from "@serenityjs/binarystream";

class TextParameters extends DataType {
	public static override read(
		stream: BinaryStream,
		_: Endianness,
		type: TextPacketType
	): Array<string> | null {
		// Check if the type is Raw, Whisper or Announcement.
		if (
			type === TextPacketType.Translation ||
			type === TextPacketType.Popup ||
			type === TextPacketType.JukeboxPopup
		) {
			// Prepare an array to store the parameters.
			const parameters: Array<string> = [];

			// Read the number of parameters.
			const amount = stream.readVarInt();

			// Loop through the amount of parameters.
			for (let index = 0; index < amount; index++) {
				// Read the parameter from the stream.
				parameters.push(stream.readVarString());
			}

			// Return the parameters.
			return parameters;
		} else {
			// Return null.
			return null;
		}
	}

	public static override write(
		stream: BinaryStream,
		value: Array<string>,
		_: Endianness,
		type: TextPacketType
	): void {
		// Check if the type is Raw, Whisper or Announcement.
		if (
			type === TextPacketType.Translation ||
			type === TextPacketType.Popup ||
			type === TextPacketType.JukeboxPopup
		) {
			// Write the number of parameters.
			stream.writeVarInt(value.length);

			// Loop through the parameters.
			for (const parameter of value) {
				// Write the parameter to the stream.
				stream.writeVarString(parameter);
			}
		}
	}
}

export { TextParameters };
