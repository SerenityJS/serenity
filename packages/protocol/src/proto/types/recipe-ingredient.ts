import { BinaryStream, Endianness, DataType } from "@serenityjs/binarystream";

import { InternalType } from "../../enums";

interface RecipeIngredientDefault {
  networkId: number;
  metadata: number;
}

interface RecipeIngredientMolang {
  molang: string;
  version: number;
}

interface RecipeIngredientItemTag {
  tag: string;
}

interface RecipeIngredientDeferred {
  name: string;
  metadata: number;
}

interface RecipeIngredientComplexAlias {
  name: string;
}

type RecipeIngredientType =
  | RecipeIngredientDefault
  | RecipeIngredientMolang
  | RecipeIngredientItemTag
  | RecipeIngredientDeferred
  | RecipeIngredientComplexAlias;

// WHY
class RecipeIngredient extends DataType {
  /**
   * The type of the ingredient.
   */
  public readonly type: InternalType;

  /**
   * The the ingredient item definition based on the type.
   */
  public readonly definition: RecipeIngredientType | null;

  /**
   * The stack size of the ingredient
   */
  public readonly stackSize: number;

  /**
   * Constructor for the RecipeIngredient class
   * @param type The type of the ingredient.
   * @param stackSize The stack size of the ingredient
   * @param definition The the ingredient item definition based on the type.
   */
  public constructor(
    type: InternalType,
    stackSize: number,
    definition: RecipeIngredientType | null
  ) {
    super();
    this.type = type;
    this.stackSize = stackSize;
    this.definition = definition;
  }

  public static read(stream: BinaryStream): RecipeIngredient {
    // Read the type
    const type = stream.readUint8();

    // Initialize the definition variable
    let definition: RecipeIngredientType | null = null;

    // Switch based on the type
    switch (type) {
      default: {
        throw new Error(
          `Unknown ingredient type: ${type}, offset: ${stream.offset}`
        );
      }

      case InternalType.Invalid: {
        break;
      }

      case InternalType.Default: {
        // Read the network ID
        const networkId = stream.readInt16(Endianness.Little);

        // Read the metadata
        const metadata =
          networkId === 0 ? 0 : stream.readInt16(Endianness.Little);

        // Set the default variable
        definition = { networkId, metadata };

        break;
      }

      case InternalType.Molang: {
        // Read the molang string
        const molang_ = stream.readVarString();

        // Read the version
        const version = stream.readUint8();

        // Set the molang variable
        definition = { molang: molang_, version };
        break;
      }

      case InternalType.ItemTag: {
        // Read the tag
        const tag = stream.readVarString();

        // Set the itemTag variable
        definition = { tag };
        break;
      }

      case InternalType.Deferred: {
        // Read the name
        const name = stream.readVarString();

        // Read the metadata
        const metadata = stream.readInt16(Endianness.Little);

        // Set the deferred variable
        definition = { name, metadata };
        break;
      }

      case InternalType.ComplexAlias: {
        // Read the name
        const name = stream.readVarString();

        // Set the complexAlias variable
        definition = { name };
        break;
      }
    }

    // Read the stack size
    const stackSize = stream.readZigZag();

    // Return the new RecipeIngredient instance
    return new this(type, stackSize, definition);
  }

  public static write(stream: BinaryStream, value: RecipeIngredient): void {
    // Write the type
    stream.writeUint8(value.type);

    // Switch based on the type
    switch (value.type) {
      default: {
        throw new Error(`Unknown ingredient type: ${value.type}`);
      }

      case InternalType.Invalid: {
        break;
      }

      case InternalType.Default: {
        // Check if the default variable is null
        const definition = value.definition as RecipeIngredientDefault;

        // Write the network ID
        stream.writeInt16(definition.networkId, Endianness.Little);

        // Write the metadata
        if (definition.networkId !== 0) {
          stream.writeInt16(definition.metadata, Endianness.Little);
        }

        break;
      }

      case InternalType.Molang: {
        // Check if the molang variable is null
        const molang = value.definition as RecipeIngredientMolang;

        // Write the molang string
        stream.writeVarString(molang.molang);

        // Write the version
        stream.writeUint8(molang.version);

        break;
      }

      case InternalType.ItemTag: {
        // Check if the itemTag variable is null
        const itemTag = value.definition as RecipeIngredientItemTag;

        // Write the tag
        stream.writeVarString(itemTag.tag);

        break;
      }

      case InternalType.Deferred: {
        // Check if the deferred variable is null
        const deferred = value.definition as RecipeIngredientDeferred;

        // Write the name
        stream.writeVarString(deferred.name);

        // Write the metadata
        stream.writeInt16(deferred.metadata, Endianness.Little);

        break;
      }

      case InternalType.ComplexAlias: {
        // Check if the complexAlias variable is null
        const complexAlias = value.definition as RecipeIngredientComplexAlias;

        // Write the name
        stream.writeVarString(complexAlias.name);

        break;
      }
    }

    // Write the stack size
    stream.writeZigZag(value.stackSize);
  }
}

export { RecipeIngredient };
