import { BinaryStream, DataType } from "@serenityjs/binarystream";

import { type ContainerId, InventorySourceType } from "../../enums";

/**
 * Represents the source of an inventory action.
 */
class InventorySource extends DataType {
  /**
   * The source type of the inventory action.
   */
  public readonly type: InventorySourceType;

  /**
   * The container id of the inventory source.
   * If the source type is not ContainerInventory, then this value will not be present.
   */
  public readonly containerId: ContainerId | null;

  /**
   * The bit flags of the inventory source.
   * If the source type is not GlobalInteraction, then this value will not be present.
   */
  public readonly bitFlags: number | null;

  /**
   * Creates an instance of InventorySource.
   *
   * @param type The source type of the inventory action.
   * @param containerId The container id of the inventory source.
   * @param bitFlags The bit flags of the inventory source.
   */
  public constructor(
    type: InventorySourceType,
    containerId?: ContainerId | null,
    bitFlags?: number | null
  ) {
    super();
    this.type = type;
    this.containerId = containerId ?? null;
    this.bitFlags = bitFlags ?? null;
  }

  public static read(stream: BinaryStream): InventorySource {
    const type = stream.readVarInt();

    let containerId: ContainerId | null = null;
    let bitFlags: number | null = null;

    if (!stream.readBool()) {
      throw new Error("Inventory source container presence marker missing.");
    }

    if (stream.readBool()) {
      containerId = stream.readInt8();
    }

    if (!stream.readBool()) {
      throw new Error("Inventory source flags presence marker missing.");
    }

    if (stream.readBool()) {
      bitFlags = stream.readVarInt();
    }

    return new InventorySource(type, containerId, bitFlags);
  }

  public static write(stream: BinaryStream, value: InventorySource): void {
    stream.writeVarInt(value.type);

    stream.writeBool(true);

    const hasContainerId =
      value.type === InventorySourceType.ContainerInventory ||
      value.type === InventorySourceType.NonImplementedFeatureTODO;
    stream.writeBool(hasContainerId);

    if (hasContainerId) {
      if (value.containerId === null) {
        throw new Error("Inventory source must have a containerId value");
      }

      stream.writeInt8(value.containerId);
    }

    stream.writeBool(true);

    const hasBitFlags = value.type === InventorySourceType.WorldInteraction;
    stream.writeBool(hasBitFlags);

    if (hasBitFlags) {
      if (value.bitFlags === null) {
        throw new Error("WorldInteraction type must have a bitFlags value");
      }

      stream.writeVarInt(value.bitFlags);
    }
  }
}

export { InventorySource };
