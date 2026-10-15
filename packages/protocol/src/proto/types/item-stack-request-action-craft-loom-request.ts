import { BinaryStream, DataType } from "@serenityjs/binarystream";

class ItemStackRequestActionCraftLoomRequest extends DataType {
  /**
   * The pattern of the stack request craft loom action.
   */
  public readonly pattern: string;

  /**
   * The amount of times the pattern was crafted.
   */
  public readonly timesCrafted: number;

  /**
   * Creates a new instance of ItemStackRequestActionCraftLoomRequest.
   * @param pattern - The pattern of the stack request craft
   * @param timesCrafted - The amount of times the pattern was crafted
   */
  public constructor(pattern: string, timesCrafted = 1) {
    super();
    this.pattern = pattern;
    this.timesCrafted = timesCrafted;
  }

  public static read(
    stream: BinaryStream
  ): ItemStackRequestActionCraftLoomRequest {
    // Read the pattern.
    const pattern = stream.readVarString();

    // Read the amount of times the pattern was crafted.
    const timesCrafted = stream.readUint8();

    // Return the stack request craft loom action.
    return new this(pattern, timesCrafted);
  }

  public static write(
    stream: BinaryStream,
    value: ItemStackRequestActionCraftLoomRequest
  ): void {
    // Write the pattern.
    stream.writeVarString(value.pattern);

    // Write the amount of times the pattern was crafted.
    stream.writeUint8(value.timesCrafted);
  }
}

export { ItemStackRequestActionCraftLoomRequest };
