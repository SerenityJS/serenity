import { BinaryStream, DataType } from "@serenityjs/binarystream";

import {
  HandSlot,
  type ItemUseOnEntityInventoryTransactionType
} from "../../enums";

import { NetworkItemStackDescriptorCereal } from "./network-item-stack-descriptor-cereal";
import { Vector3f } from "./vector3f";

/**
 * Represents an item use on entity inventory transaction.
 */
class ItemUseOnEntityInventoryTransaction extends DataType {
  /**
   * The runtime ID of the actor.
   */
  public readonly actorRuntimeId: bigint;

  /**
   * The type of the item use on entity inventory transaction.
   */
  public readonly type: ItemUseOnEntityInventoryTransactionType;

  /**
   * The slot of the item use on entity inventory transaction.
   */
  public readonly slot: number;

  /**
   * The hand of the item being used.
   */
  public readonly hand: HandSlot;

  /**
   * The item of the item use on entity inventory transaction.
   */
  public readonly item: NetworkItemStackDescriptorCereal;

  /**
   * The from position of the item use on entity inventory transaction.
   */
  public readonly fromPosition: Vector3f;

  /**
   * The click position of the item use on entity inventory transaction.
   */
  public readonly clickPosition: Vector3f;

  /**
   * Creates an instance of ItemUseOnEntityInventoryTransaction.
   * @param actorRuntimeId - The runtime ID of the actor.
   * @param type - The type of the item use on entity inventory transaction.
   * @param slot - The slot of the item use on entity inventory transaction.
   * @param item - The item of the item use on entity inventory transaction.
   * @param fromPosition - The from position of the item use on entity inventory transaction.
   * @param clickPosition - The click position of the item use on entity inventory transaction.
   * @param hand - The hand of the item being used.
   */
  public constructor(
    actorRuntimeId: bigint,
    type: ItemUseOnEntityInventoryTransactionType,
    slot: number,
    item: NetworkItemStackDescriptorCereal,
    fromPosition: Vector3f,
    clickPosition: Vector3f,
    hand = HandSlot.MainHand
  ) {
    super();
    this.actorRuntimeId = actorRuntimeId;
    this.type = type;
    this.slot = slot;
    this.item = item;
    this.fromPosition = fromPosition;
    this.clickPosition = clickPosition;
    this.hand = hand;
  }

  public static read(
    stream: BinaryStream
  ): ItemUseOnEntityInventoryTransaction {
    // Read the runtime ID of the actor
    const actorRuntimeId = stream.readVarLong();

    // Read the type of the item use on entity inventory transaction
    const type = stream.readZigZag() as ItemUseOnEntityInventoryTransactionType;

    // Read the slot of the item use on entity inventory transaction
    const slot = stream.readZigZag();

    // Read the hand of the item being used
    const hand = stream.readVarInt() as HandSlot;

    // Read the item of the item use on entity inventory transaction
    const item = NetworkItemStackDescriptorCereal.read(stream);

    // Read the from position of the item use on entity inventory transaction
    const fromPosition = Vector3f.read(stream);

    // Read the click position of the item use on entity inventory transaction
    const clickPosition = Vector3f.read(stream);

    // Return the new instance of ItemUseOnEntityInventoryTransaction
    return new ItemUseOnEntityInventoryTransaction(
      actorRuntimeId,
      type,
      slot,
      item,
      fromPosition,
      clickPosition,
      hand
    );
  }

  public static write(
    stream: BinaryStream,
    value: ItemUseOnEntityInventoryTransaction
  ): void {
    // Write the runtime ID of the actor
    stream.writeVarLong(value.actorRuntimeId);

    // Write the type of the item use on entity inventory transaction
    stream.writeZigZag(value.type);

    // Write the slot of the item use on entity inventory transaction
    stream.writeZigZag(value.slot);

    // Write the hand of the item being used
    stream.writeVarInt(value.hand);

    // Write the item of the item use on entity inventory transaction
    NetworkItemStackDescriptorCereal.write(stream, value.item);

    // Write the from position of the item use on entity inventory transaction
    Vector3f.write(stream, value.fromPosition);

    // Write the click position of the item use on entity inventory transaction
    Vector3f.write(stream, value.clickPosition);
  }
}

export { ItemUseOnEntityInventoryTransaction };
