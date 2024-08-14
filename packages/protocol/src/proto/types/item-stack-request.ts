import { DataType } from "@serenityjs/raknet";
import { Endianness, type BinaryStream } from "@serenityjs/binarystream";

import { ItemStackRequestAction } from "./item-stack-request-action";

class ItemStackRequest extends DataType {
	/**
	 * The item stack request id.
	 */
	public readonly clientRequestId: number;

	/**
	 * The item stack request actions.
	 */
	public readonly actions: Array<ItemStackRequestAction>;

	/**
	 * The filter strings of the item stack request.
	 */
	public readonly filterStrings: Array<string>;

	/**
	 * The origin of the strings filter.
	 */
	public readonly stringsFilterOrigin: number;

	/**
	 * Creates a new instance of ItemStackRequest.
	 * @param clientRequestId - The item stack request id.
	 * @param actions - The item stack request actions.
	 * @param filterStrings - The filter strings of the item stack request.
	 * @param stringsFilterOrigin - The origin of the strings filter.
	 */
	public constructor(
		clientRequestId: number,
		actions: Array<ItemStackRequestAction>,
		filterStrings: Array<string>,
		stringsFilterOrigin: number
	) {
		super();
		this.clientRequestId = clientRequestId;
		this.actions = actions;
		this.filterStrings = filterStrings;
		this.stringsFilterOrigin = stringsFilterOrigin;
	}

	public static read(stream: BinaryStream): Array<ItemStackRequest> {
		// Read the requests.
		const requests = new Array<ItemStackRequest>();
		const count = stream.readVarInt();
		for (let index = 0; index < count; index++) {
			// Read the client request id.
			const clientRequestId = stream.readZigZag();

			// Read the actions.
			const actions = new Array<ItemStackRequestAction>();
			const actionsCount = stream.readVarInt();
			for (let index = 0; index < actionsCount; index++) {
				actions.push(ItemStackRequestAction.read(stream));
			}

			// Read the filter strings.
			const filterStrings = new Array<string>();
			const filterStringsCount = stream.readVarInt();
			for (let index = 0; index < filterStringsCount; index++) {
				filterStrings.push(stream.readVarString());
			}

			// Read the strings filter origin.
			const stringsFilterOrigin = stream.readInt32(Endianness.Little);

			// Add the request.
			requests.push(
				new ItemStackRequest(
					clientRequestId,
					actions,
					filterStrings,
					stringsFilterOrigin
				)
			);
		}

		// Return the requests.
		return requests;
	}

	public static write(
		stream: BinaryStream,
		value: Array<ItemStackRequest>
	): void {
		// Write the amount of requests.
		stream.writeVarInt(value.length);

		// Iterate through the requests.
		for (const request of value) {
			// Write the client request id.
			stream.writeZigZag(request.clientRequestId);

			// Write the amount of actions.
			stream.writeVarInt(request.actions.length);

			// Iterate through the actions.
			for (const action of request.actions) {
				// Write the action.
				ItemStackRequestAction.write(stream, action);
			}

			// Write the amount of filter strings.
			stream.writeVarInt(request.filterStrings.length);

			// Iterate through the filter strings.
			for (const filterString of request.filterStrings) {
				// Write the filter string.
				stream.writeVarString(filterString);
			}

			// Write the strings filter origin.
			stream.writeInt32(request.stringsFilterOrigin, Endianness.Little);
		}
	}
}

export { ItemStackRequest };
