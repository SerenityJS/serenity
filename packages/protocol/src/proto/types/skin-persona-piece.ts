import { BinaryStream, DataType } from "@serenityjs/binarystream";

/**
 * Represents a piece of a persona skin.
 */
class SkinPersonaPiece extends DataType {
  /**
   * The identifier of the piece.
   */
  public readonly identifier: string;

  /**
   * The type of the piece.
   */
  public readonly type: string;

  /**
   * The pack identifier of the piece.
   */
  public readonly packIdentifier: string;

  /**
   * The is default state of the piece.
   */
  public readonly isDefault: boolean;

  /**
   * The product identifier of the piece.
   */
  public readonly productIdentifier: string;

  /**
   * Creates a new piece of a persona skin.
   *
   * @param identifier The identifier of the piece.
   * @param type The type of the piece.
   * @param packIdentifier The pack identifier of the piece.
   * @param isDefault The is default state of the piece.
   * @param productIdentifier The product identifier of the piece.
   */
  public constructor(
    identifier: string,
    type: string,
    packIdentifier: string,
    isDefault: boolean,
    productIdentifier: string
  ) {
    super();
    this.identifier = identifier;
    this.type = type;
    this.packIdentifier = packIdentifier;
    this.isDefault = isDefault;
    this.productIdentifier = productIdentifier;
  }

  public static read(stream: BinaryStream): SkinPersonaPiece {
    // Read the identifier, type, pack identifier, is default state and product identifier of the piece.
    const identifier = stream.readVarString();
    const type = stream.readVarString();
    const packIdentifier = stream.readVarString();
    const isDefault = stream.readBool();
    const productIdentifier = stream.readVarString();

    // Return the new piece of a persona skin.
    return new SkinPersonaPiece(
      identifier,
      type,
      packIdentifier,
      isDefault,
      productIdentifier
    );
  }

  public static write(stream: BinaryStream, piece: SkinPersonaPiece): void {
    // Write the identifier, type, pack identifier, is default state and product identifier of the piece.
    stream.writeVarString(piece.identifier);
    stream.writeVarString(piece.type);
    stream.writeVarString(piece.packIdentifier);
    stream.writeBool(piece.isDefault);
    stream.writeVarString(piece.productIdentifier);
  }
}

export { SkinPersonaPiece };
