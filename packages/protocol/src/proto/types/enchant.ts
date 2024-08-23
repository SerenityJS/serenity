import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binarystream";

class Enchant extends DataType {
	public id: number;
	public level: number;

	public constructor(id: number, level: number) {
		super();

		this.id = id;
		this.level = level;
	}

	public static override read(stream: BinaryStream): Array<Enchant> {
		const enchants: Array<Enchant> = [];

		const amount = stream.readVarInt();

		for (let index = 0; index < amount; index++) {
			const id = stream.readByte();
			const level = stream.readByte();

			enchants.push(new Enchant(id, level));
		}

		return enchants;
	}

	public static override write(
		stream: BinaryStream,
		value: Array<Enchant>
	): void {
		stream.writeVarInt(value.length);

		for (const enchant of value) {
			stream.writeByte(enchant.id);
			stream.writeByte(enchant.level);
		}
	}
}

export { Enchant };
