import type { BinaryStream } from '@serenityjs/binaryutils';
import { DataType } from '@serenityjs/raknet-protocol';
import type { ContainerSlotType } from '../enums/index.js';

class StackRequestSlotInfo extends DataType {
	public type: ContainerSlotType;
	public slot: number;
	public stackId: number;

	public constructor(type: number, slot: number, stackId: number) {
		super();
		this.type = type;
		this.slot = slot;
		this.stackId = stackId;
	}

	public static override read(stream: BinaryStream): StackRequestSlotInfo {
		// Read the type.
		const type = stream.readUint8();

		// Read the slot.
		const slot = stream.readUint8();

		// Read the stack id.
		const stackId = stream.readZigZag();

		// Return the stack request slot info.
		return new StackRequestSlotInfo(type, slot, stackId);
	}

	public static override write(stream: BinaryStream, value: StackRequestSlotInfo): void {
		// Write the type.
		stream.writeUint8(value.type);

		// Write the slot.
		stream.writeUint8(value.slot);

		// Write the stack id.
		stream.writeZigZag(value.stackId);
	}
}

export { StackRequestSlotInfo };
