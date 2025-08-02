import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { InventorySource } from "./inventory-source";
import { NetworkItemStackDescriptor } from "./network-item-stack-descriptor";

/**
 * Represents an inventory action with in a inventory transaction.
 */
class InventoryAction extends DataType {
  /**
   * The source type of the inventory action.
   */
  public readonly source: InventorySource;

  /**
   * The slot of the inventory action.
   */
  public readonly slot: number;

  /**
   * The old item of the inventory action.
   */
  public readonly oldItem: NetworkItemStackDescriptor;

  /**
   * The new item of the inventory action.
   */
  public readonly newItem: NetworkItemStackDescriptor;

  /**
   * Creates a new instance of InventoryAction.
   *
   * @param source - The source type of the inventory action.
   * @param slot - The slot of the inventory action.
   * @param oldItem - The old item of the inventory action.
   * @param newItem - The new item of the inventory action.
   */
  public constructor(
    source: InventorySource,
    slot: number,
    oldItem: NetworkItemStackDescriptor,
    newItem: NetworkItemStackDescriptor
  ) {
    super();
    this.source = source;
    this.slot = slot;
    this.oldItem = oldItem;
    this.newItem = newItem;
  }

  public static read(stream: BinaryStream): InventoryAction {
    // Read the source of the inventory action
    const source = InventorySource.read(stream);

    // Read the slot of the inventory action
    const slot = stream.readVarInt();

    // Read the old & new item of the inventory action
    const oldItem = NetworkItemStackDescriptor.read(stream);
    const newItem = NetworkItemStackDescriptor.read(stream);

    // Return the new instance of InventoryAction
    return new InventoryAction(source, slot, oldItem, newItem);
  }

  public static write(stream: BinaryStream, value: InventoryAction): void {
    // Write the source of the inventory action
    InventorySource.write(stream, value.source);

    // Write the slot of the inventory action
    stream.writeVarInt(value.slot);

    // Write the old & new item of the inventory action
    NetworkItemStackDescriptor.write(stream, value.oldItem);
    NetworkItemStackDescriptor.write(stream, value.newItem);
  }
}

export { InventoryAction };
