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

/**
 * The wildcard aux value, which matches any metadata of an item.
 */
const WILDCARD_AUX = 32767;

/**
 * Since v2168, an ingredient is a variant: index 0 is an empty descriptor,
 * and index 1 is a named descriptor ("name", "molang" or "item_tag") followed by its payload.
 * Items are referenced by name; the network id ("Default") and alias descriptors no longer exist on the wire.
 * Name descriptors are read as `InternalType.Deferred`.
 */
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
    // Read the variant index of the descriptor
    const variant = stream.readVarInt();

    // Prepare the type and definition of the ingredient
    let type = InternalType.Invalid;
    let definition: RecipeIngredientType | null = null;

    // Check if the descriptor is empty
    if (variant === 0) {
      // Read the aux value of the empty descriptor
      stream.readZigZag();
    } else {
      // Read the name of the descriptor type
      const name = stream.readVarString();

      // Read the descriptor based on its type
      switch (name) {
        default: {
          throw new Error(
            `Unknown ingredient descriptor: ${name}, offset: ${stream.offset}`
          );
        }

        case "name": {
          // Read the item name and the aux value
          const itemName = stream.readVarString();
          const metadata = stream.readZigZag();

          type = InternalType.Deferred;
          definition = { name: itemName, metadata };
          break;
        }

        case "molang": {
          // Read the molang expression and its version
          const molang = stream.readVarString();
          const version = stream.readInt16(Endianness.Little);

          type = InternalType.Molang;
          definition = { molang, version };
          break;
        }

        case "item_tag": {
          // Read the item tag, followed by an aux value
          const tag = stream.readVarString();
          stream.readZigZag();

          type = InternalType.ItemTag;
          definition = { tag };
          break;
        }
      }
    }

    // Read the stack size
    const stackSize = stream.readZigZag();

    // Return the ingredient
    return new this(type, stackSize, definition);
  }

  public static write(stream: BinaryStream, value: RecipeIngredient): void {
    switch (value.type) {
      default: {
        throw new Error(
          `Unsupported ingredient type: ${InternalType[value.type] ?? value.type}; items are referenced by name since v2168, use InternalType.Deferred`
        );
      }

      case InternalType.Invalid: {
        // Write the empty descriptor, followed by the wildcard aux value
        stream.writeVarInt(0);
        stream.writeZigZag(WILDCARD_AUX);
        break;
      }

      case InternalType.Deferred: {
        const definition = value.definition as RecipeIngredientDeferred;

        // Write the name descriptor
        stream.writeVarInt(1);
        stream.writeVarString("name");
        stream.writeVarString(definition.name);
        stream.writeZigZag(definition.metadata);
        break;
      }

      case InternalType.ComplexAlias: {
        const definition = value.definition as RecipeIngredientComplexAlias;

        // Aliases are no longer a descriptor type; write them as a name matching any aux value
        stream.writeVarInt(1);
        stream.writeVarString("name");
        stream.writeVarString(definition.name);
        stream.writeZigZag(WILDCARD_AUX);
        break;
      }

      case InternalType.Molang: {
        const definition = value.definition as RecipeIngredientMolang;

        // Write the molang descriptor
        stream.writeVarInt(1);
        stream.writeVarString("molang");
        stream.writeVarString(definition.molang);
        stream.writeInt16(definition.version, Endianness.Little);
        break;
      }

      case InternalType.ItemTag: {
        const definition = value.definition as RecipeIngredientItemTag;

        // Write the item tag descriptor, followed by the wildcard aux value
        stream.writeVarInt(1);
        stream.writeVarString("item_tag");
        stream.writeVarString(definition.tag);
        stream.writeZigZag(WILDCARD_AUX);
        break;
      }
    }

    // Write the stack size
    stream.writeZigZag(value.stackSize);
  }
}

export { RecipeIngredient };
