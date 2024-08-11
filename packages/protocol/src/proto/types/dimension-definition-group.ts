import { DataType } from "@serenityjs/raknet";

import { DimensionDefinition } from "./dimension-definition";

import type { BinaryStream } from "@serenityjs/binarystream";

class DimensionDefinitionGroup extends DataType {
	public definitions: Array<DimensionDefinition>;

	public constructor(definitions: Array<DimensionDefinition>) {
		super();
		this.definitions = definitions;
	}

	public static write(
		stream: BinaryStream,
		value: DimensionDefinitionGroup
	): void {
		stream.writeVarInt(value.definitions.length);

		for (const definition of value.definitions) {
			DimensionDefinition.write(stream, definition);
		}
	}

	public static read(stream: BinaryStream): DimensionDefinitionGroup {
		const definitions: Array<DimensionDefinition> = [];
		const definitionsLength = stream.readVarInt();

		for (let index = 0; index < definitionsLength; index++) {
			definitions.push(DimensionDefinition.read(stream));
		}
		return new DimensionDefinitionGroup(definitions);
	}
}

export { DimensionDefinitionGroup };
