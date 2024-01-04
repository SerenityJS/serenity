import type { BinaryStream } from '@serenityjs/binarystream';
import { Endianness } from '@serenityjs/binarystream';
import { DataType } from '@serenityjs/raknet-protocol';

interface Tokens {
	client: string;
	identity: string;
}

class LoginTokens extends DataType {
	public static override read(stream: BinaryStream): Tokens {
		stream.readVarInt(); // length?
		// Shows the length is 8 bytes longer than the combined length of the two strings
		// Not sure what the extra 8 bytes are for

		const identity = stream.readString32(Endianness.Little);
		const client = stream.readString32(Endianness.Little);

		return {
			client,
			identity,
		};
	}

	public static override write(stream: BinaryStream, value: Tokens): void {
		stream.writeVarInt(value.identity.length + value.client.length); // Probably wrong
		stream.writeString32(value.identity, Endianness.Little);
		stream.writeString32(value.client, Endianness.Little);
	}
}

export { LoginTokens, type Tokens };
