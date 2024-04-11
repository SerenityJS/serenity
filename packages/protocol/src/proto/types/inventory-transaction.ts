import { DataType } from "@serenityjs/raknet";

import { ComplexInventoryTransaction } from "../../enums";

import { InventoryAction } from "./inventory-action";
import { ItemUseInventoryTransaction } from "./item-use-inventory-transaction";
import { ItemUseOnEntityInventoryTransaction } from "./item-use-on-entity-inventory-transaction";
import { ItemReleaseInventoryTransaction } from "./item-release-inventory-transaction";

import type { BinaryStream } from "@serenityjs/binarystream";

/**
 * Represents an inventory transaction.
 */
class InventoryTransaction extends DataType {
	/**
	 * The type of the inventory transaction.
	 */
	public readonly type: ComplexInventoryTransaction;

	/**
	 * The actions of the inventory transaction.
	 */
	public readonly actions: Array<InventoryAction>;

	/**
	 * The item use of the inventory transaction.
	 */
	public readonly itemUse: ItemUseInventoryTransaction | null;

	/**
	 * The item use on entity of the inventory transaction.
	 */
	public readonly itemUseOnEntity: ItemUseOnEntityInventoryTransaction | null;

	/**
	 * The item release of the inventory transaction.
	 */
	public readonly itemRelease: ItemReleaseInventoryTransaction | null;

	/**
	 * Creates a new instance of InventoryTransaction.
	 * @param actions - The actions of the inventory transaction.
	 * @param type - The type of the inventory transaction.
	 * @param itemUse - The item use of the inventory transaction.
	 * @param itemUseOnEntity - The item use on entity of the inventory transaction.
	 * @param itemRelease - The item release of the inventory transaction.
	 */
	public constructor(
		type: ComplexInventoryTransaction,
		actions: Array<InventoryAction>,
		itemUse?: ItemUseInventoryTransaction | null,
		itemUseOnEntity?: ItemUseOnEntityInventoryTransaction | null,
		itemRelease?: ItemReleaseInventoryTransaction | null
	) {
		super();
		this.type = type;
		this.actions = actions;
		this.itemUse = itemUse ?? null;
		this.itemUseOnEntity = itemUseOnEntity ?? null;
		this.itemRelease = itemRelease ?? null;
	}

	public static read(stream: BinaryStream): InventoryTransaction {
		// Read the type of the inventory transaction
		const type = stream.readVarInt() as ComplexInventoryTransaction;

		// Read the amount of actions
		const amount = stream.readVarInt();

		// Prepare the actions of the inventory transaction
		// And iterate through the actions
		const actions: Array<InventoryAction> = [];
		for (let index = 0; index < amount; index++) {
			// Read the action
			const action = InventoryAction.read(stream);

			// Push the action to the actions
			actions.push(action);
		}

		// Check if the amount of actions is greater than 0
		if (actions.length > 0) {
			// Return the new instance of InventoryTransaction
			return new InventoryTransaction(type, actions);
		}

		// Switch based on the type of the inventory transaction
		switch (type) {
			// Check if the type is not implemented
			default: {
				throw new Error(
					`Unknown/not implemented inventory transaction type: ${type}`
				);
			}

			// If the type is 0 or 1 (NormalTransaction or InventoryMismatch) then return the new instance of InventoryTransaction
			case ComplexInventoryTransaction.NormalTransaction:
			case ComplexInventoryTransaction.InventoryMismatch: {
				// Return the new instance of InventoryTransaction
				return new InventoryTransaction(type, actions);
			}

			// If the type is 2 (ItemUseTransaction) then read the use item
			case ComplexInventoryTransaction.ItemUseTransaction: {
				// Read the use item
				const itemUse = ItemUseInventoryTransaction.read(stream);

				// Return the new instance of InventoryTransaction
				return new InventoryTransaction(type, actions, itemUse);
			}

			// If the type is 3 (ItemUseOnEntityTransaction) then read the use item
			case ComplexInventoryTransaction.ItemUseOnEntityTransaction: {
				// Read the use item
				const itemUseOnEntity =
					ItemUseOnEntityInventoryTransaction.read(stream);

				// Return the new instance of InventoryTransaction
				return new InventoryTransaction(type, actions, null, itemUseOnEntity);
			}

			// If the type is 4 (ItemReleaseTransaction) then return the new instance of InventoryTransaction
			case ComplexInventoryTransaction.ItemReleaseTransaction: {
				// Read the release item
				const itemRelease = ItemReleaseInventoryTransaction.read(stream);

				// Return the new instance of InventoryTransaction
				return new InventoryTransaction(type, actions, null, null, itemRelease);
			}
		}
	}

	public static write(stream: BinaryStream, value: InventoryTransaction): void {
		// Write the type of the inventory transaction
		stream.writeVarInt(value.type);

		// Write the amount of actions
		stream.writeVarInt(value.actions.length);

		// Iterate through the actions
		for (const action of value.actions) {
			// Write the action
			InventoryAction.write(stream, action);
		}

		// Switch based on the type of the inventory transaction
		switch (value.type) {
			// Check if the type is not implemented
			default: {
				throw new Error(
					`Unknown/not implemented inventory transaction type: ${value.type}`
				);
			}

			// If the type is 0 or 1 (NormalTransaction or InventoryMismatch) then return
			case ComplexInventoryTransaction.NormalTransaction:
			case ComplexInventoryTransaction.InventoryMismatch: {
				// Return
				return;
			}

			// If the type is 2 (ItemUseTransaction) then write the use item
			case ComplexInventoryTransaction.ItemUseTransaction: {
				// Write the use item
				ItemUseInventoryTransaction.write(
					stream,
					value.itemUse as ItemUseInventoryTransaction
				);

				// Return
				return;
			}

			// If the type is 3 (ItemUseOnEntityTransaction) then write the use item
			case ComplexInventoryTransaction.ItemUseOnEntityTransaction: {
				// Write the use item
				ItemUseOnEntityInventoryTransaction.write(
					stream,
					value.itemUseOnEntity as ItemUseOnEntityInventoryTransaction
				);

				// Return
				return;
			}

			// If the type is 4 (ItemReleaseTransaction) then write the release item
			case ComplexInventoryTransaction.ItemReleaseTransaction: {
				// Write the release item
				ItemReleaseInventoryTransaction.write(
					stream,
					value.itemRelease as ItemReleaseInventoryTransaction
				);

				// Return
				return;
			}
		}
	}
}

export { InventoryTransaction };
