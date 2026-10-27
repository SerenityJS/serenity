import { BinaryStream, DataType } from "@serenityjs/binarystream";

import {
  HandSlot,
  type ItemReleaseInventoryTransactionType
} from "../../enums";

import { NetworkItemStackDescriptorCereal } from "./network-item-stack-descriptor-cereal";
import { Vector3f } from "./vector3f";

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
  public readonly item: NetworkItemStackDescriptorCereal;

  /**
   * The head position of the item release inventory transaction.
   */
  public readonly headPosition: Vector3f;

  /**
   * The hand of the item being released.
   */
  public readonly hand: HandSlot;

  /**
   * Creates an instance of ItemReleaseInventoryTransaction.
   * @param type - The type of the item release inventory transaction.
   * @param slot - The slot of the item release inventory transaction.
   * @param item - The item of the item release inventory transaction.
   * @param headPosition - The head position of the item release inventory transaction.
   * @param hand - The hand of the item being released.
   */
  public constructor(
    type: ItemReleaseInventoryTransactionType,
    slot: number,
    item: NetworkItemStackDescriptorCereal,
    headPosition: Vector3f,
    hand = HandSlot.MainHand
  ) {
    super();
    this.type = type;
    this.slot = slot;
    this.item = item;
    this.headPosition = headPosition;
    this.hand = hand;
  }

  public static read(stream: BinaryStream): ItemReleaseInventoryTransaction {
    // Read the type of the item release inventory transaction
    const type = stream.readZigZag() as ItemReleaseInventoryTransactionType;

    // Read the slot of the item release inventory transaction
    const slot = stream.readZigZag();

    // Read the item of the item release inventory transaction
    const item = NetworkItemStackDescriptorCereal.read(stream);

    // Read the head position of the item release inventory transaction
    const headPosition = Vector3f.read(stream);

    // Read the hand of the item being released
    const hand = stream.readVarInt() as HandSlot;

    // Return the new instance of ItemReleaseInventoryTransaction
    return new ItemReleaseInventoryTransaction(
      type,
      slot,
      item,
      headPosition,
      hand
    );
  }

  public static write(
    stream: BinaryStream,
    value: ItemReleaseInventoryTransaction
  ): void {
    // Write the type of the item release inventory transaction
    stream.writeZigZag(value.type);

    // Write the slot of the item release inventory transaction
    stream.writeZigZag(value.slot);

    // Write the item of the item release inventory transaction
    NetworkItemStackDescriptorCereal.write(stream, value.item);

    // Write the head position of the item release inventory transaction
    Vector3f.write(stream, value.headPosition);

    // Write the hand of the item being released
    stream.writeVarInt(value.hand);
  }
}

export { ItemReleaseInventoryTransaction };
