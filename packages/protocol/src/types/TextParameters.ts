import type { BinaryStream, Endianness } from '@serenityjs/binarystream';
import { DataType } from '@serenityjs/raknet-protocol';
import { ChatTypes } from '../enums';

class TextParameters extends DataType {
	public static override read(stream: BinaryStream, _: Endianness, type: ChatTypes): string[] | null {
		// Check if the type is Raw, Whisper or Announcement.
		if (type === ChatTypes.Translation || type === ChatTypes.Popup || type === ChatTypes.JukeboxPopup) {
			// Prepare an array to store the parameters.
			const parameters: string[] = [];

			// Read the number of parameters.
			const amount = stream.readVarInt();

			// Loop through the amount of parameters.
			for (let i = 0; i < amount; i++) {
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

	public static override write(stream: BinaryStream, value: string[], _: Endianness, type: ChatTypes): void {
		// Check if the type is Raw, Whisper or Announcement.
		if (type === ChatTypes.Translation || type === ChatTypes.Popup || type === ChatTypes.JukeboxPopup) {
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
