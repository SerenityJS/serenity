import type { BinaryStream } from '@serenityjs/binarystream';
import { Endianness } from '@serenityjs/binarystream';
import { DataType } from '@serenityjs/raknet-protocol';

class TexturePackInfo extends DataType {
	public contentIdentity: string;
	public contentKey: string;
	public hasScripts: boolean;
	public rtxEnabled: boolean;
	public size: number;
	public subpackName: string;
	public uuid: string;
	public version: string;

	public constructor(
		contentIdentity: string,
		contentKey: string,
		hasScripts: boolean,
		rtxEnabled: boolean,
		size: number,
		subpackName: string,
		uuid: string,
		version: string,
	) {
		super();
		this.contentIdentity = contentIdentity;
		this.contentKey = contentKey;
		this.hasScripts = hasScripts;
		this.rtxEnabled = rtxEnabled;
		this.size = size;
		this.subpackName = subpackName;
		this.uuid = uuid;
		this.version = version;
	}

	public static override read(stream: BinaryStream): TexturePackInfo[] {
		// Prepare an array to store the packs.
		const packs: TexturePackInfo[] = [];

		// Read the number of packs.
		const amount = stream.readInt16(Endianness.Little);

		// We then loop through the amount of packs.
		// Reading the individual fields in the stream.
		for (let i = 0; i < amount; i++) {
			// Read all the fields for the pack.
			const uuid = stream.readVarString();
			const version = stream.readVarString();
			const size = stream.readUint32(Endianness.Little);
			const contentKey = stream.readVarString();
			const subpackName = stream.readVarString();
			const contentIdentity = stream.readVarString();
			const hasScripts = stream.readBool();
			const rtxEnabled = stream.readBool();

			// Push the pack to the array.
			packs.push(
				new TexturePackInfo(contentIdentity, contentKey, hasScripts, rtxEnabled, size, subpackName, uuid, version),
			);
		}

		// Return the packs.
		return packs;
	}

	public static override write(stream: BinaryStream, value: TexturePackInfo[]): void {
		// Write the number of packs given in the array.
		stream.writeInt16(value.length, Endianness.Little);

		// Loop through the packs.
		for (const pack of value) {
			// Write the fields for the pack.
			stream.writeVarString(pack.uuid);
			stream.writeVarString(pack.version);
			stream.writeUint32(pack.size, Endianness.Little);
			stream.writeVarString(pack.contentKey);
			stream.writeVarString(pack.subpackName);
			stream.writeVarString(pack.contentIdentity);
			stream.writeBool(pack.hasScripts);
			stream.writeBool(pack.rtxEnabled);
		}
	}
}

export { TexturePackInfo };
