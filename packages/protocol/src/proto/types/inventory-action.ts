import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { InventorySource } from "./inventory-source";
import { NetworkItemStackDescriptorCereal } from "./network-item-stack-descriptor-cereal";

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
  public readonly oldItem: NetworkItemStackDescriptorCereal;

  /**
   * The new item of the inventory action.
   */
  public readonly newItem: NetworkItemStackDescriptorCereal;

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
    oldItem: NetworkItemStackDescriptorCereal,
    newItem: NetworkItemStackDescriptorCereal
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
    const oldItem = NetworkItemStackDescriptorCereal.read(stream);
    const newItem = NetworkItemStackDescriptorCereal.read(stream);

    // Return the new instance of InventoryAction
    return new InventoryAction(source, slot, oldItem, newItem);
  }

  public static write(stream: BinaryStream, value: InventoryAction): void {
    // Write the source of the inventory action
    InventorySource.write(stream, value.source);

    // Write the slot of the inventory action
    stream.writeVarInt(value.slot);

    // Write the old & new item of the inventory action
    NetworkItemStackDescriptorCereal.write(stream, value.oldItem);
    NetworkItemStackDescriptorCereal.write(stream, value.newItem);
  }
}

export { InventoryAction };
