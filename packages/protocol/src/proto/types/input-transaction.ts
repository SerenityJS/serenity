import { BinaryStream } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet";
import { LegacyTransaction } from "./legacy-transaction";
import { InventoryAction } from "./inventory-action";
import { ItemUseInventoryTransaction } from "./item-use-inventory-transaction";

class InputTransaction extends DataType {
  public legacyTransaction!: LegacyTransaction;
  public actions!: Array<InventoryAction>;
  public trasactionUseItem!: ItemUseInventoryTransaction;

  public constructor(
    legacyTransactionn: LegacyTransaction,
    actions: Array<InventoryAction>,
    transactionUseItem: ItemUseInventoryTransaction
  ) {
    super();
    this.legacyTransaction = legacyTransactionn;
    this.actions = actions;
    this.trasactionUseItem = transactionUseItem;
  }
  public static write(stream: BinaryStream, value: InputTransaction) {
    LegacyTransaction.write(stream, value.legacyTransaction);

    stream.writeVarInt(value.actions.length);
      
    for(const action of value.actions) {
      InventoryAction.write(stream, action);
    }
      
    ItemUseInventoryTransaction.write(stream, value.trasactionUseItem);
  }

  public static read(stream: BinaryStream): InputTransaction {
    const legacyTransaction = LegacyTransaction.read(stream);
    const amount = stream.readVarInt();
    const actions: Array<InventoryAction> = [];

		for (let index = 0; index < amount; index++) {
			const action = InventoryAction.read(stream);
			actions.push(action);
		}
    
    const transactionUseItem = ItemUseInventoryTransaction.read(stream);
    return new this(legacyTransaction, actions, transactionUseItem);
  }
}

export { InputTransaction }