import { DataType } from "@serenityjs/raknet";

import { NetworkItemStackDescriptor } from "./network-item-stack-descriptor";
import { Vector3f } from "./vector3f";

import type { BinaryStream } from "@serenityjs/binarystream";
import type { ItemReleaseInventoryTransactionType } from "../../enums";

class ItemReleaseInventoryTransaction extends DataType {
  /**
   * The type of the item release inventory transaction.
   */
  public readonly type: ItemReleaseInventoryTransactionType;

  /**
   * The slot of the item release inventory transaction.
   */
  public readonly slot: number;

  /**
   * The item of the item release inventory transaction.
   */
  public readonly item: NetworkItemStackDescriptor;

  /**
   * The head position of the item release inventory transaction.
   */
  public readonly headPosition: Vector3f;

  /**
   * Creates an instance of ItemReleaseInventoryTransaction.
   * @param type - The type of the item release inventory transaction.
   * @param slot - The slot of the item release inventory transaction.
   * @param item - The item of the item release inventory transaction.
   * @param headPosition - The head position of the item release inventory transaction.
   */
  public constructor(
    type: ItemReleaseInventoryTransactionType,
    slot: number,
    item: NetworkItemStackDescriptor,
    headPosition: Vector3f
  ) {
    super();
    this.type = type;
    this.slot = slot;
    this.item = item;
    this.headPosition = headPosition;
  }

  public static read(stream: BinaryStream): ItemReleaseInventoryTransaction {
    // Read the type of the item release inventory transaction
    const type = stream.readVarInt() as ItemReleaseInventoryTransactionType;

    // Read the slot of the item release inventory transaction
    const slot = stream.readZigZag();

    // Read the item of the item release inventory transaction
    const item = NetworkItemStackDescriptor.read(stream);

    // Read the head position of the item release inventory transaction
    const headPosition = Vector3f.read(stream);

    // Return the new instance of ItemReleaseInventoryTransaction
    return new ItemReleaseInventoryTransaction(type, slot, item, headPosition);
  }

  public static write(
    stream: BinaryStream,
    value: ItemReleaseInventoryTransaction
  ): void {
    // Write the type of the item release inventory transaction
    stream.writeVarInt(value.type);

    // Write the slot of the item release inventory transaction
    stream.writeZigZag(value.slot);

    // Write the item of the item release inventory transaction
    NetworkItemStackDescriptor.write(stream, value.item);

    // Write the head position of the item release inventory transaction
    Vector3f.write(stream, value.headPosition);
  }
}

export { ItemReleaseInventoryTransaction };
