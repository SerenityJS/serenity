import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binaryutils";

class Links extends DataType {
	public immediate: boolean;
	public riddenEntityId: bigint;
	public riderEntityId: bigint;
	public riderInitiated: boolean;
	public type: number;

	public constructor(
		immediate: boolean,
		riddenEntityId: bigint,
		riderEntityId: bigint,
		riderInitiated: boolean,
		type: number
	) {
		super();
		this.immediate = immediate;
		this.riddenEntityId = riddenEntityId;
		this.riderEntityId = riderEntityId;
		this.riderInitiated = riderInitiated;
		this.type = type;
	}

	public static override read(stream: BinaryStream): Array<Links> {
		// Prepare an array to store the links.
		const links: Array<Links> = [];

		// Read the number of links
		const amount = stream.readVarInt();

		// We then loop through the amount of links.
		// Reading the individual fields in the stream.
		for (let index = 0; index < amount; index++) {
			// Read all the fields for the link.
			const riddenEntityId = stream.readZigZong();
			const riderEntityId = stream.readZigZong();
			const type = stream.readUint8();
			const immediate = stream.readBool();
			const riderInitiated = stream.readBool();

			// Push the link to the array.
			links.push(
				new Links(
					immediate,
					riddenEntityId,
					riderEntityId,
					riderInitiated,
					type
				)
			);
		}

		// Return the links.
		return links;
	}

	public static override write(
		stream: BinaryStream,
		value: Array<Links>
	): void {
		// Write the number of links given in the array.
		stream.writeVarInt(value.length);

		// Loop through the links.
		for (const link of value) {
			// Write the fields for the link.
			stream.writeZigZong(link.riddenEntityId);
			stream.writeZigZong(link.riderEntityId);
			stream.writeUint8(link.type);
			stream.writeBool(link.immediate);
			stream.writeBool(link.riderInitiated);
		}
	}
}

export { Links };
