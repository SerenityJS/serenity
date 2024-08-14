import { DataType } from "@serenityjs/raknet";
import { Endianness, type BinaryStream } from "@serenityjs/binarystream";

import type { ContainerName } from "../../enums";

class FullContainerName extends DataType {
	/**
	 * The identifier of the container.
	 */
	public readonly identifier: ContainerName;

	/**
	 * The identifier of the container, if it is dynamic.
	 */
	public readonly dynamicIdentifier: number;

	/**
	 * Creates a new instance of FullContainerName.
	 * @param identifier - The identifier of the container.
	 * @param dynamicIdentifier - The identifier of the container, if it is dynamic.
	 */
	public constructor(identifier: ContainerName, dynamicIdentifier: number) {
		super();
		this.identifier = identifier;
		this.dynamicIdentifier = dynamicIdentifier;
	}

	public static read(stream: BinaryStream): FullContainerName {
		// Read the identifier.
		const identifier = stream.readUint8();

		// Read the dynamic identifier.
		const dynamicIdentifier = stream.readUint32(Endianness.Little);

		// Return the full container name.
		return new FullContainerName(identifier, dynamicIdentifier);
	}

	public static write(stream: BinaryStream, value: FullContainerName): void {
		// Write the identifier.
		stream.writeUint8(value.identifier);

		// Write the dynamic identifier.
		stream.writeUint32(value.dynamicIdentifier, Endianness.Little);
	}
}

export { FullContainerName };
