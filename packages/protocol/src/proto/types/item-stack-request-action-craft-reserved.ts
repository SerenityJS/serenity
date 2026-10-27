import { BinaryStream, DataType } from "@serenityjs/binarystream";

class ItemStackRequestActionCraftReserved extends DataType {
  /**
   * The reserved identifier of the craft reserved action.
   */
  public readonly reservedId: string;

  /**
   * The amount of times the reserved action was crafted.
   */
  public readonly numCrafts: number;

  /**
   * Creates a new instance of ItemStackRequestActionCraftReserved.
   * @param reservedId - The reserved identifier of the craft reserved action.
   * @param numCrafts - The amount of times the reserved action was crafted.
   */
  public constructor(reservedId: string, numCrafts = 1) {
    super();
    this.reservedId = reservedId;
    this.numCrafts = numCrafts;
  }

  public static read(
    stream: BinaryStream
  ): ItemStackRequestActionCraftReserved {
    // Read the reserved identifier.
    const reservedId = stream.readVarString();

    // Read the amount of times the reserved action was crafted.
    const numCrafts = stream.readUint8();

    // Return the craft reserved action.
    return new this(reservedId, numCrafts);
  }

  public static write(
    stream: BinaryStream,
    value: ItemStackRequestActionCraftReserved
  ): void {
    // Write the reserved identifier.
    stream.writeVarString(value.reservedId);

    // Write the amount of times the reserved action was crafted.
    stream.writeUint8(value.numCrafts);
  }
}

export { ItemStackRequestActionCraftReserved };
