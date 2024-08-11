import { DataType } from "@serenityjs/raknet";

import type { GeneratorType } from "../../enums";
import type { BinaryStream } from "@serenityjs/binarystream";

class DimensionDefinition extends DataType {
	public identifier: string;
	public heightMax: number;
	public heightMin: number;
	public generatorType: GeneratorType;

	public constructor(
		identifier: string,
		heightMax: number,
		heightMin: number,
		generatorType: GeneratorType
	) {
		super();
		this.identifier = identifier;
		this.heightMax = heightMax;
		this.heightMin = heightMin;
		this.generatorType = generatorType;
	}

	public static write(stream: BinaryStream, value: DimensionDefinition): void {
		stream.writeVarString(value.identifier);
		stream.writeVarInt(value.heightMax);
		stream.writeVarInt(value.heightMin);
		stream.writeVarInt(value.generatorType);
	}

	public static read(stream: BinaryStream): DimensionDefinition {
		return new DimensionDefinition(
			stream.readVarString(), // ? Name
			stream.readVarInt(), // ? Max height
			stream.readVarInt(), // ? Min height
			stream.readVarInt() // ? Generator Type
		);
	}
}

export { DimensionDefinition };
