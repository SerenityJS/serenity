import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binarystream";
import type { HUDElementId } from "../../enums";

class HUDElement extends DataType {
	public hudElementId: HUDElementId;

	public constructor(hudElementId: HUDElementId) {
		super();
		this.hudElementId = hudElementId;
	}

	public static override read(stream: BinaryStream): Array<HUDElement> {
		const elements: Array<HUDElement> = [];

		const amount = stream.readVarInt();

		for (let index = 0; index < amount; index++) {
			const elementId = stream.readByte();

			const element = new HUDElement(elementId);

			elements.push(element);
		}

		return elements;
	}

	public static override write(
		stream: BinaryStream,
		value: Array<HUDElement>
	): void {
		stream.writeVarInt(value.length);

		for (const element of value) {
			stream.writeByte(element.hudElementId);
		}
	}
}

export { HUDElement };
