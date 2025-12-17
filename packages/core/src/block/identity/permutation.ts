import { BinaryStream } from "@serenityjs/binarystream";
import {
  BaseTag,
  ByteTag,
  CompoundTag,
  IntTag,
  ListTag,
  LongTag,
  StringTag,
  TagType
} from "@serenityjs/nbt";
import { BLOCK_STATE_VERSION } from "@serenityjs/protocol";

import { BlockState } from "../types";
import { BlockIdentifier } from "../../enums";

import { BlockType } from "./type";
import { BlockTypeComponentCollection } from "./collection";

class BlockPermutation {
  /**
   * A collective registry of all block permutations.
   */
  public static readonly permutations = new Map<number, BlockPermutation>();

  /**
   * The offset of the hash algorithm.
   */
  public static readonly hashOffset = 0x81_1c_9d_c5;

  /**
   * The network hash of the block permutation.
   */
  public readonly networkId: number;

  /**
   * The index value of the block permutation in the block type.
   */
  public readonly index: number;

  /**
   * The state of the block permutation.
   */
  public readonly state: BlockState;

  /**
   * The block type of the block permutation.
   */
  public readonly type: BlockType;

  /**
   * The Molang conditional query of the block permutation.
   * This is used on the client end to determine the block state and components.
   */
  public readonly query: string;

  /**
   * The vanilla components of the block permutation. (hardness, friction, lighting, etc.s)
   * This components are active on the client end when the query condition is met.
   * These components will override any global components of the block type.
   */
  public readonly components: BlockTypeComponentCollection;

  /**
   * Additional nbt data for the block permutation.
   * This data is applied to the block when it is placed in the world.
   */
  public readonly nbt: CompoundTag = new CompoundTag();

  /**
   * Whether the block permutation is component based.
   * This is determined by the presence of any components in the block permutation.
   */
  public get isComponentBased(): boolean {
    return this.components.size > 0;
  }

  /**
   * Create a new block permutation.
   * @param network The network hash of the block permutation.
   * @param state The state of the block permutation.
   * @param type The block type of the block permutation.
   * @param query The Molang conditional query of the block permutation.
   */
  public constructor(
    networkId: number,
    state: BlockState,
    type: BlockType,
    query?: string
  ) {
    // Assign the block permutation properties.
    this.networkId = networkId;
    this.state = state;
    this.type = type;
    this.index = type.permutations.length;
    this.components = new BlockTypeComponentCollection(this);

    // Get keys of the block state.
    const keys = Object.keys(state ?? {});

    // Check if the query is provided.
    if (query) this.query = query;
    else {
      // Create the MolangQuery for the permutation.
      let query = String();
      for (const key of keys) {
        // Get the value of the block state.
        let value = state[key as keyof BlockState] as unknown;

        // Update the value if it is a string.
        value = typeof value === "string" ? `'${value}'` : value;

        // Append the query for the block state.
        query += `query.block_state('${key}') == ${value}`;

        // Check if a conjunction is needed.
        if (keys.indexOf(key) !== keys.length - 1) query += " && ";
      }

      // Assign the block permutation query.
      this.query = query;
    }
  }

  /**
   * Check if the block permutation matches the identifier and state.
   * @param identifier The block identifier to match.
   * @param state The block state to match.
   */
  public matches(state: BlockState): boolean {
    // Check if the block state matches.
    for (const key in state) {
      if (this.state[key] !== state[key]) {
        return false;
      }
    }

    // Return true if the block permutation matches.
    return true;
  }

  /**
   * Resolve a block permutation from the block identifier and state.
   * @param identifier The block identifier to resolve.
   * @param state The block state to resolve.
   */
  public static resolve(
    identifier: BlockIdentifier | string | number,
    state?: BlockState
  ): BlockPermutation {
    // Get the block type from the registry.
    const type =
      typeof identifier === "number"
        ? this.permutations.get(identifier)?.type
        : BlockType.get(identifier as BlockIdentifier);

    // Check if the block type exists.
    if (!type) return this.resolve(BlockIdentifier.Air) as BlockPermutation;

    // Check if the state is not provided.
    const permutation = type.permutations.find((permutation) => {
      for (const key in state) {
        // Get the value of the block state.
        const value = (permutation.state as never)[key];

        // Check if the value is a boolean
        const bool = value === true || value === false ? true : false;

        // Convert the state to a boolean if it is a boolean.
        const query =
          bool && (state[key] === 0 || state[key] === 1)
            ? state[key] === 1
            : state[key];

        // Check if the block state matches
        if (value !== query) {
          return false;
        }
      }

      // Return true if the block permutation matches.
      return true;
    });

    // Check if the block permutation does not exist.
    if (!permutation) {
      // Return the default permutation if the state is not found.
      return type.permutations[0] as BlockPermutation;
    }

    // Return the block permutation.
    return permutation as BlockPermutation;
  }

  /**
   * Create a new block permutation.
   * Primarily used for custom block types.
   * @param type The block type of the block permutation.
   * @param state The state of the block permutation.
   */
  public static create(
    type: BlockType,
    state: BlockState = {},
    components: Partial<BlockTypeComponentCollection> = {},
    query?: string
  ): BlockPermutation {
    // Reorder the state object keys so that the keys are in alphabetical order.
    const sorted: Record<string, number | string | boolean> = {};

    // Iterate over the keys of the block state.
    for (const key of Object.keys(state).sort()) {
      // Assign the key to the sorted state.
      sorted[key] = state[key] as number | string | boolean;

      // Check if the block type has the key in the states.
      if (!type.states.includes(key))
        // Add the key to the block type states.
        type.states.push(key);
    }

    // Calculate the network hash of the block permutation.
    const network = BlockPermutation.hash(type.identifier, sorted);

    // Create a new block permutation.
    const permutation = new this(network, sorted, type, query);

    // Register the block permutation.
    BlockPermutation.permutations.set(network, permutation);

    // Register the permutation in the block type.
    type.permutations.push(permutation);

    // Assignt the properties of the block permutation.
    Object.assign(permutation.components, components);

    // Get the properties of the block type.
    const typeProperties =
      type.properties.get<ListTag<CompoundTag>>("properties");

    // Get the permutations of the block type.
    const permutations =
      type.properties.get<ListTag<CompoundTag>>("permutations");

    // Get the keys of the block state.
    const keys = Object.keys(sorted);

    // Check if the properties exist
    if (typeProperties) {
      // Iterate over the keys of the block state.
      for (const key of keys) {
        // Get the value of the key
        const value = sorted[key];

        // Find the property in the properties.
        let property = typeProperties.find((value) => {
          // Get the name tag of the property.
          const name = value.get<StringTag>("name");

          // Check if the name tag exists and matches the key.
          return name && name.valueOf() === key;
        });

        // If the property does not exist, create a new property.
        if (!property) {
          // Create a new property tag.
          property = new CompoundTag();

          // Create the name tag for the property.
          property.add(new StringTag(key, "name"));

          // Create the value tag for the property.
          property.add(new ListTag<BaseTag>([], "enum"));

          // Add the property to the properties.
          typeProperties.push(property);
        }

        // Check if the value is a boolean.
        const enums = property.get<ListTag<BaseTag>>("enum");

        // Find the index of the value in the property.
        const index = enums?.find((tag) => tag.valueOf() === value);

        // Add the value to the property if it does not exist.
        if (!index) enums?.push(this.createTag(value));
      }
    }

    if (permutations) {
      // Create a new permutation tag.
      const tag = new CompoundTag();

      // Create the condition tag for the permutation.
      tag.add(new StringTag(permutation.query, "condition"));

      // Add the permutation properties to the tag.
      tag.push(permutation.components);

      // Add the permutation to the permutations.
      permutations.push(tag);
    }

    // Return the block permutation.
    return permutation;
  }

  /**
   * Convert the block permutation to a compound tag. (Used for disk storage)
   * @param permutation The block permutation to convert.
   * @returns The compound tag representation of the block permutation.
   */
  public static toCompound(permutation: BlockPermutation): CompoundTag {
    // Create a new compound tag for the block permutation.
    const root = new CompoundTag();

    // Add the name and version tags to the root tag.
    root.add(new StringTag(permutation.type.identifier, "name"));
    root.add(new IntTag(BLOCK_STATE_VERSION, "version"));

    // Create a new compound tag with the name of "states".
    const states = root.add(new CompoundTag("states"));

    // Separate the keys and values of the state object.
    const keys = Object.keys(permutation.state);
    const values = Object.values(permutation.state);

    // Loop through each key and value in the state object.
    for (const [index, key] of keys.entries()) {
      // Get the value of the state.
      const value = values[index];

      // Switch the type of the value and create the appropriate tag.
      switch (typeof value) {
        case "number": {
          states.add(new IntTag(value, key));
          break;
        }

        case "string": {
          states.add(new StringTag(value, key));
          break;
        }

        case "boolean": {
          states.add(new ByteTag(value ? 1 : 0, key));
          break;
        }
      }
    }

    // Return the root tag.
    return root;
  }

  /**
   * Get a block permutation from a compound tag. (Used for disk storage)
   * @param nbt The compound tag to convert.
   * @returns The block permutation.
   */
  public static fromCompound(nbt: CompoundTag): BlockPermutation {
    // Get the name and states tags from the compound tag.
    const name = nbt.get<StringTag>("name");
    const states = nbt.get<CompoundTag>("states");

    // Check if the name tag exists.
    if (!name) throw new Error(`Block permutation is missing the 'name' tag.`);

    // Create a new state object.
    const state: Record<string, number | string> = {};

    // Check if the states tag exists.
    if (states) {
      // Iterate over each tag in the states compound tag.
      for (const [key, tag] of states.entries()) {
        state[key] = tag.valueOf() as number | string;
      }
    }

    // Resolve and return the block permutation.
    return BlockPermutation.resolve(name.valueOf() as BlockIdentifier, state);
  }

  protected static getTagType(value: unknown): TagType {
    switch (typeof value) {
      case "boolean":
        return TagType.Byte;
      case "number":
        return TagType.Int;
      case "bigint":
        return TagType.Long;
      case "string":
        return TagType.String;
      default:
        throw new Error(`Unsupported value type: ${typeof value}`);
    }
  }

  protected static createTag(value: unknown): BaseTag {
    switch (typeof value) {
      case "boolean":
        return new ByteTag(value ? 1 : 0);
      case "number":
        return new IntTag(value);
      case "bigint":
        return new LongTag(value);
      case "string":
        return new StringTag(value);
      default:
        throw new Error(`Unsupported value type: ${typeof value}`);
    }
  }

  public static hash(identifier: string, state: BlockState): number {
    // Separate the keys and values of the state object.
    const keys = Object.keys(state);
    const values = Object.values(state);

    // Create a new compound tag with the name of the identifier.
    const root = new CompoundTag();
    root.add(new StringTag(identifier, "name"));

    // Create a new compound tag with the name of "states".
    const states = root.add(new CompoundTag("states"));

    // Loop through each key and value in the state object.
    for (const [index, key] of keys.entries()) {
      const value = values[index];

      switch (typeof value) {
        case "number": {
          states.add(new IntTag(value, key));
          break;
        }

        case "string": {
          states.add(new StringTag(value, key));
          break;
        }

        case "boolean": {
          states.add(new ByteTag(value ? 1 : 0, key));
          break;
        }
      }
    }

    // Create a new binary stream and write the root tag to it.
    const stream = new BinaryStream();
    CompoundTag.write(stream, root);

    // Assign the hash to the offset.
    let hash = this.hashOffset;

    // Loop through each element in the buffer.
    for (const element of stream.getBuffer()) {
      // Set the hash to the XOR of the hash and the element.
      hash ^= element & 0xff;

      // Apply the hash algorithm.
      hash +=
        (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);

      // Convert the hash to a signed 32-bit integer.
      hash = hash | 0;
    }

    // Return the hash.
    return hash;
  }
}

export { BlockPermutation };
