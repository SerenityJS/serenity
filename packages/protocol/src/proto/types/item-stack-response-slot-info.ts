import { BinaryStream, DataType } from "@serenityjs/binarystream";

class ItemStackResponseSlotInfo extends DataType {
  /**
   * The slot the response is referring to.
   */
  public slot: number;

  /**
   * The amount of items in the slot.
   */
  public amount: number;

  /**
   * The item stack id.
   */
  public itemStackId: number;

  /**
   * The custom name of the item in the slot.
   */
  public customName: string;

  /**
   * The filter custom name of the item in the slot.
   */
  public filterCustomName: string;

  /**
   * The durability correction of the item in the slot.
   */
  public durabilityCorrection: number;

  /**
   * Creates a new ItemStackResponseSlotInfo instance.
   * @param slot The slot the response is referring to.
   * @param amount The amount of items in the slot.
   * @param itemStackId The item stack id.
   * @param customName The custom name of the item in the slot.
   * @param filterCustomName The filter custom name of the item in the slot.
   * @param durabilityCorrection The durability correction of the item in the slot.
   */
  public constructor(
    slot: number,
    amount: number,
    itemStackId: number,
    customName: string,
    filterCustomName: string,
    durabilityCorrection: number
  ) {
    super();
    this.slot = slot;
    this.amount = amount;
    this.itemStackId = itemStackId;
    this.customName = customName;
    this.filterCustomName = filterCustomName;
    this.durabilityCorrection = durabilityCorrection;
  }

  public static read(stream: BinaryStream): ItemStackResponseSlotInfo {
    // These slot properties seem to be the same value, so we read both and AND them together.
    const requestedSlot = stream.readUint8();
    const slot = stream.readUint8();

    const amount = stream.readUint8();
    const itemStackId = stream.readZigZag();
    const customName = stream.readVarString();
    const filterCustomName = stream.readVarString();
    const durabilityCorrection = stream.readZigZag();

    // Return a new instance of the ItemStackResponseSlotInfo class.
    return new this(
      requestedSlot & slot,
      amount,
      itemStackId,
      customName,
      filterCustomName,
      durabilityCorrection
    );
  }

  public static write(
    stream: BinaryStream,
    value: ItemStackResponseSlotInfo
  ): void {
    stream.writeUint8(value.slot);
    stream.writeUint8(value.slot);
    stream.writeUint8(value.amount);
    stream.writeZigZag(value.itemStackId);
    stream.writeVarString(value.customName);
    stream.writeVarString(value.filterCustomName);
    stream.writeZigZag(value.durabilityCorrection);
  }
}

export { ItemStackResponseSlotInfo };
