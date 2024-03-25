import { type BinaryStream } from "@serenityjs/binaryutils";
import { DataType } from "@serenityjs/raknet";

import type { ItemStackStatus, ContainerName } from "../../enums";

interface ItemStackContainer {
	slots: Array<ContainerSlot>;
	type: ContainerName;
}

interface ContainerSlot {
	amount: number;
	durabilityCorrection: number;
	hotbarSlot: number;
	nametag: string;
	runtimeId: number;
	slot: number;
}

class ItemStackResponses extends DataType {
	public status: ItemStackStatus;
	public id: number;
	public containers?: Array<ItemStackContainer>;

	public constructor(
		status: number,
		id: number,
		containers?: Array<ItemStackContainer>
	) {
		super();
		this.status = status;
		this.id = id;
		this.containers = containers;
	}

	public static override read(stream: BinaryStream): Array<ItemStackResponses> {
		// Prepare an array to store the stacks.
		const stacks: Array<ItemStackResponses> = [];

		// Read the number of stacks.
		const amount = stream.readVarInt();

		// We then loop through the amount of stacks.
		// Reading the individual fields in the stream.
		for (let index = 0; index < amount; index++) {
			// Read all the fields for the pack.
			const status = stream.readUint8();
			const id = stream.readZigZag();

			if (status > 0) {
				stacks.push(new ItemStackResponses(status, id));
			} else {
				// Read the amount of containers.
				const containerAmount = stream.readVarInt();

				// Prepare an array to store the containers.
				const containers: Array<ItemStackContainer> = [];

				// Read the slot type.
				const type = stream.readUint8();

				// Read the amount of slots.
				const slotAmount = stream.readVarInt();

				// Prepare an array to store the slots.
				const slots: Array<ContainerSlot> = [];

				// We then loop through the amount of slots.
				// Reading the individual fields in the stream.
				for (let index = 0; index < slotAmount; index++) {
					// We then loop through the amount of containers.
					// Reading the individual fields in the stream.
					for (let index = 0; index < containerAmount; index++) {
						// Read all the fields for the container.
						const slot = stream.readUint8();
						const hotbarSlot = stream.readUint8();
						const amount = stream.readUint8();
						const runtimeId = stream.readZigZag();
						const nametag = stream.readVarString();
						const durabilityCorrection = stream.readZigZag();

						// Push the container.
						slots.push({
							amount,
							nametag,
							durabilityCorrection,
							hotbarSlot,
							runtimeId,
							slot
						});
					}
				}

				// Push the container.
				containers.push({ slots, type });

				// Push the stack.
				stacks.push(new ItemStackResponses(status, id, containers));
			}
		}

		// Return the stacks.
		return stacks;
	}

	public static override write(
		stream: BinaryStream,
		value: Array<ItemStackResponses>
	): void {
		// Write the number of stacks.
		stream.writeVarInt(value.length);

		// We then loop through the amount of stacks.
		// Writing the individual fields to the stream.
		for (const stack of value) {
			// Write all the fields for the pack.
			stream.writeUint8(stack.status);
			stream.writeZigZag(stack.id);

			if (stack.status > 0) {
				continue;
			} else {
				// Write the amount of containers.
				stream.writeVarInt(stack.containers!.length);

				// We then loop through the amount of containers.
				// Writing the individual fields to the stream.
				for (const container of stack.containers!) {
					// Write the slot type.
					stream.writeUint8(container.type);

					// Write the amount of slots.
					stream.writeVarInt(container.slots.length);

					// We then loop through the amount of slots.
					// Writing the individual fields to the stream.
					for (const slot of container.slots) {
						// Write all the fields for the container.
						stream.writeUint8(slot.slot);
						stream.writeUint8(slot.hotbarSlot);
						stream.writeUint8(slot.amount);
						stream.writeZigZag(slot.runtimeId);
						stream.writeVarString(slot.nametag);
						stream.writeZigZag(slot.durabilityCorrection);
					}
				}
			}
		}
	}
}

export { ItemStackResponses, type ItemStackContainer };
