import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binarystream";

class AnimateEntity extends DataType {
	public actorRuntimeId!: bigint;

	public constructor(actorRuntimeId: bigint) {
		super();
		this.actorRuntimeId = actorRuntimeId;
	}

	public static override read(stream: BinaryStream): Array<AnimateEntity> {
		const elements: Array<AnimateEntity> = [];

		const amount = stream.readVarInt();

		for (let index = 0; index < amount; index++) {
			const actorRuntimeId = stream.readZigZong();

			const entry = new AnimateEntity(actorRuntimeId);

			elements.push(entry);
		}

		return elements;
	}

	public static override write(
		stream: BinaryStream,
		value: Array<AnimateEntity>
	): void {
		stream.writeVarInt(value.length);

		for (const entries of value) {
			stream.writeZigZong(entries.actorRuntimeId);
		}
	}
}

export { AnimateEntity };
