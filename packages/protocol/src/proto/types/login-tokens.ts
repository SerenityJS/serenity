import { Endianness } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binarystream";

class LoginTokens extends DataType {
	public client: string;
	public identity: string;

	public constructor(client: string, identity: string) {
		super();
		this.client = client;
		this.identity = identity;
	}

	public static override read(stream: BinaryStream): LoginTokens {
		stream.readVarInt(); // length?
		// Shows the length is 8 bytes longer than the combined length of the two strings
		// Not sure what the extra 8 bytes are for

		const identity = stream.readString32(Endianness.Little);
		const client = stream.readString32(Endianness.Little);

		return new LoginTokens(client, identity);
	}

	public static override write(stream: BinaryStream, value: LoginTokens): void {
		stream.writeVarInt(value.identity.length + value.client.length + 8); // Should be rigt?
		stream.writeString32(value.identity, Endianness.Little);
		stream.writeString32(value.client, Endianness.Little);
	}
}

export { LoginTokens };
