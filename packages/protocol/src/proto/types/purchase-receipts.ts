import { BinaryStream, DataType } from "@serenityjs/binarystream";

class PurchaseReceipts extends DataType {
  public receipts: Array<string>;

  public constructor(receipts: Array<string>) {
    super();
    this.receipts = receipts;
  }

  public static read(stream: BinaryStream): PurchaseReceipts {
    const receiptCount = stream.readVarInt();
    const receipts: Array<string> = [];

    for (let i = 0; i < receiptCount; i++) {
      receipts.push(stream.readVarString());
    }

    return new PurchaseReceipts(receipts);
  }

  public static write(stream: BinaryStream, value: PurchaseReceipts): void {
    stream.writeVarInt(value.receipts.length);

    for (const receipt of value.receipts) {
      stream.writeVarString(receipt);
    }
  }
}

export { PurchaseReceipts };
