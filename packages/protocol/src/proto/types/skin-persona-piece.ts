import { BinaryStream, DataType, Endianness } from "@serenityjs/binarystream";

import { PersonaPieceType } from "../../enums";

import { Uuid } from "./uuid";

/**
 * The piece type names used in login data, indexed by their network value.
 */
const PersonaPieceTypeNames: Record<PersonaPieceType, string> = {
  [PersonaPieceType.Unknown]: "unknown",
  [PersonaPieceType.Skeleton]: "persona_skeleton",
  [PersonaPieceType.Body]: "persona_body",
  [PersonaPieceType.Skin]: "persona_skin",
  [PersonaPieceType.Bottom]: "persona_bottom",
  [PersonaPieceType.Feet]: "persona_feet",
  [PersonaPieceType.Dress]: "persona_dress",
  [PersonaPieceType.Top]: "persona_top",
  [PersonaPieceType.HighPants]: "persona_high_pants",
  [PersonaPieceType.Hands]: "persona_hand",
  [PersonaPieceType.Outerwear]: "persona_outerwear",
  [PersonaPieceType.FacialHair]: "persona_facial_hair",
  [PersonaPieceType.Mouth]: "persona_mouth",
  [PersonaPieceType.Eyes]: "persona_eyes",
  [PersonaPieceType.Hair]: "persona_hair",
  [PersonaPieceType.Hood]: "persona_hood",
  [PersonaPieceType.Back]: "persona_back",
  [PersonaPieceType.FaceAccessory]: "persona_face_accessory",
  [PersonaPieceType.Head]: "persona_head",
  [PersonaPieceType.Legs]: "persona_legs",
  [PersonaPieceType.LeftLeg]: "persona_left_leg",
  [PersonaPieceType.RightLeg]: "persona_right_leg",
  [PersonaPieceType.Arms]: "persona_arms",
  [PersonaPieceType.LeftArm]: "persona_left_arm",
  [PersonaPieceType.RightArm]: "persona_right_arm",
  [PersonaPieceType.Capes]: "persona_capes",
  [PersonaPieceType.ClassicSkin]: "persona_classic_skin",
  [PersonaPieceType.Emote]: "persona_emote",
  [PersonaPieceType.Unsupported]: "unsupported"
};

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
    const type = SkinPersonaPiece.toName(stream.readUint32(Endianness.Little));
    const packIdentifier = Uuid.read(stream);
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
    stream.writeUint32(SkinPersonaPiece.toType(piece.type), Endianness.Little);
    Uuid.write(stream, piece.packIdentifier);
    stream.writeBool(piece.isDefault);
    stream.writeVarString(piece.productIdentifier);
  }

  /**
   * Converts a login data piece type name to its network value.
   * @param name The piece type name, such as `persona_skeleton`.
   * @returns The network value of the piece type; `Unknown` if it is not recognized.
   */
  public static toType(name: string): PersonaPieceType {
    // The hands piece type is plural on the wire, but singular in login data
    if (name === "persona_hands") return PersonaPieceType.Hands;

    // Find the network value that matches the name
    for (const [type, typeName] of Object.entries(PersonaPieceTypeNames))
      if (typeName === name) return Number(type) as PersonaPieceType;

    // Return unknown if the name was not recognized
    return PersonaPieceType.Unknown;
  }

  /**
   * Converts a piece type network value to its login data name.
   * @param type The network value of the piece type.
   * @returns The login data name of the piece type.
   */
  public static toName(type: PersonaPieceType): string {
    return PersonaPieceTypeNames[type] ?? PersonaPieceTypeNames[0];
  }
}

export { SkinPersonaPiece };
