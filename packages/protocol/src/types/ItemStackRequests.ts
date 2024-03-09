import { Endianness, type BinaryStream } from '@serenityjs/binaryutils';
import { DataType } from '@serenityjs/raknet-protocol';
import { ItemStackActionType } from '../enums/ItemStackActionType.js';
import { ItemLegacy } from './ItemLegacy.js';
import { StackRequestSlotInfo } from './StackRequestSlotInfo.js';

interface ItemStackAction {
	cost?: number;
	count?: number;
	destination?: StackRequestSlotInfo;
	filterStringIndex?: number;
	networkId?: number;
	pattern?: string;
	predictedDurability?: number;
	primaryEffect?: number;
	randomly?: boolean;
	recipeNetworkId?: number;
	resultItems?: ItemLegacy[];
	resultedSlotId?: number;
	runtimeId?: number;
	secondaryEffect?: number;
	source?: StackRequestSlotInfo;
	timesCrafted?: number;
	type: ItemStackActionType;
	unknown1?: number;
}

class ItemStackRequests extends DataType {
	public id: number;
	public actions: ItemStackAction[];
	public names: string[];
	public cause: number;

	public constructor(id: number, actions: ItemStackAction[], names: string[], cause: number) {
		super();
		this.id = id;
		this.actions = actions;
		this.names = names;
		this.cause = cause;
	}

	public static override read(stream: BinaryStream): ItemStackRequests[] {
		// Prepare an array to store the stacks.
		const stacks: ItemStackRequests[] = [];

		// Read the number of stacks.
		const amount = stream.readVarInt();

		// We then loop through the amount of stacks.
		// Reading the individual fields in the stream.
		for (let i = 0; i < amount; i++) {
			// Read all the fields for the pack.

			const requestId = stream.readZigZag();

			// Prepare an array to store the actions.
			const actions: ItemStackAction[] = [];

			// Read the number of actions.
			const actionAmount = stream.readVarInt();

			// Loop through the amount of actions.
			for (let j = 0; j < actionAmount; j++) {
				// Read the action type.
				const type: ItemStackActionType = stream.readUint8();

				switch (type) {
					default: {
						console.error('ItemStackActionType not implemented:', ItemStackActionType[type]);
						break;
					}

					case ItemStackActionType.Take:
					case ItemStackActionType.Place: {
						// Read the count.
						const count = stream.readUint8();

						// Read the source.
						const source = StackRequestSlotInfo.read(stream);

						// Read the destination.
						const destination = StackRequestSlotInfo.read(stream);

						// Push the action to the array.
						actions.push({
							count,
							destination,
							source,
							type,
						});
						break;
					}

					case ItemStackActionType.Swap: {
						// Read the source.
						const source = StackRequestSlotInfo.read(stream);

						// Read the destination.
						const destination = StackRequestSlotInfo.read(stream);

						// Push the action to the array.
						actions.push({
							destination,
							source,
							type,
						});
						break;
					}

					case ItemStackActionType.Drop: {
						// Read the count.
						const count = stream.readUint8();

						// Read the source.
						const source = StackRequestSlotInfo.read(stream);

						// Read the randomly.
						const randomly = stream.readBool();

						// Push the action to the array.
						actions.push({
							count,
							source,
							type,
							randomly,
						});
						break;
					}

					case ItemStackActionType.Destroy:
					case ItemStackActionType.Consume: {
						// Read the count.
						const count = stream.readUint8();

						// Read the source.
						const source = StackRequestSlotInfo.read(stream);

						// Push the action to the array.
						actions.push({
							count,
							source,
							type,
						});
						break;
					}

					case ItemStackActionType.Create: {
						// Read the resulted slot id.
						const resultedSlotId = stream.readUint8();

						// Push the action to the array.
						actions.push({
							type,
							resultedSlotId,
						});
						break;
					}

					case ItemStackActionType.BeaconPayment: {
						// Read the primary effect.
						const primaryEffect = stream.readZigZag();

						// Read the secondary effect.
						const secondaryEffect = stream.readZigZag();

						// Push the action to the array.
						actions.push({
							type,
							primaryEffect,
							secondaryEffect,
						});
						break;
					}

					case ItemStackActionType.MineBlock: {
						// Read the unknown1.
						const unknown1 = stream.readZigZag();

						// Read the predicted durability.
						const predictedDurability = stream.readZigZag();

						// Read the network id.
						const networkId = stream.readZigZag();

						// Push the action to the array.
						actions.push({
							type,
							unknown1,
							predictedDurability,
							networkId,
						});
						break;
					}

					case ItemStackActionType.CraftRecipe:
					case ItemStackActionType.CraftRecipeAuto: {
						// Read the recipe network id.
						const recipeNetworkId = stream.readZigZag();

						// Push the action to the array.
						actions.push({
							type,
							recipeNetworkId,
						});
						break;
					}

					case ItemStackActionType.CraftCreative: {
						// Read the runtime id.
						const runtimeId = stream.readVarInt();

						// Push the action to the array.
						actions.push({
							type,
							runtimeId,
						});
						break;
					}

					case ItemStackActionType.Optional: {
						// Read the recipe network id.
						const recipeNetworkId = stream.readVarInt();

						// Read the filter string index.
						const filterStringIndex = stream.readInt32(Endianness.Little);

						// Push the action to the array.
						actions.push({
							type,
							recipeNetworkId,
							filterStringIndex,
						});
						break;
					}

					case ItemStackActionType.CraftGrindstoneRequest: {
						// Read the recipe network id.
						const recipeNetworkId = stream.readVarInt();

						// read the cost
						const cost = stream.readVarInt();

						// Push the action to the array.
						actions.push({
							type,
							recipeNetworkId,
							cost,
						});
						break;
					}

					case ItemStackActionType.CraftLoomRequest: {
						// Read the pattern.
						const pattern = stream.readVarString();

						// Push the action to the array.
						actions.push({
							type,
							pattern,
						});
						break;
					}

					case ItemStackActionType.NonImplemented: {
						break;
					}

					case ItemStackActionType.ResultsDeprecated: {
						// Read the item amount.
						const count = stream.readVarInt();

						const items: ItemLegacy[] = [];

						// Read the items.
						for (let i = 0; i < count; i++) {
							items.push(ItemLegacy.read(stream));
						}

						// Read the times crafted.
						const timesCrafted = stream.readUint8();

						// Push the action to the array.
						actions.push({
							count,
							resultItems: items,
							timesCrafted,
							type,
						});
						break;
					}
				}
			}

			// Read the custom names.
			const names: string[] = [];
			const namesLength = stream.readVarInt();

			// Loop through the custom names.
			for (let i = 0; i < namesLength; i++) {
				names.push(stream.readVarString());
			}

			// Read the cause.
			const cause = stream.readInt32(Endianness.Little);

			// Push the stack to the array.
			stacks.push(new ItemStackRequests(requestId, actions, names, cause));
		}

		// Return the stacks.
		return stacks;
	}

	// TODO: Implement write method
	public static override write(stream: BinaryStream, value: ItemStackRequests[]): void {
		throw new Error('Method not implemented.');
	}
}

export { ItemStackRequests, type ItemStackAction };
