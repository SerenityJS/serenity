// Regenerates the vanilla data in src/json from Dragonfly.
//
// Dragonfly (https://github.com/df-mc/dragonfly, MIT) ships data dumped from
// vanilla Bedrock Dedicated Servers for the version it supports. This script
// reads it at a pinned commit and rewrites these files:
//
//   block_permutations.json  every block state and its network hash
//   block_states.json        every block state's values
//   block_types.json         block types, with the definitions of the vanilla
//                            blocks the client only knows from the server
//   block_metadata.json      hardness, friction and map color
//   item_metadata.json       every item's network ID, version and components
//   item_types.json          the items the server registers
//   creative_groups.json     the creative inventory's groups
//   creative_content.json    the creative inventory's items
//   shaped.json              shaped crafting recipes
//   shapeless.json           shapeless, furnace and stonecutter recipes
//
// Dragonfly's dump does not hold everything these files do, so the current
// files are the base and the dump is merged into them:
//
// - Fields Dragonfly does not have (block components, tags and metadata, item
//   tags and stack sizes) are kept for existing entries. New blocks and items
//   take them from a similar existing one (see ANALOGS), and the vanilla
//   blocks defined by data (see the data_driven_blocks.nbt below) from their
//   own definitions.
// - item_types.json registers the items it did before, plus new items that
//   are like registered ones or are in the creative inventory. Items that only
//   exist as technical block forms (double slabs, wall signs...) stay out.
// - Recipes Dragonfly also has are kept as they are, with their results'
//   network IDs updated: Dragonfly's recipes have no identifiers and lost
//   ingredient aliases and some metadata. Dragonfly's recipes that are new
//   get identifiers made from their results, and recipes it does not have
//   are removed.
//
// Usage: node tools/generate.mjs [path to a Dragonfly checkout]
// Without a path, the files are downloaded from GitHub at DRAGONFLY_COMMIT.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Dragonfly's "Support 1.26.50" commit (protocol 2193).
const DRAGONFLY_COMMIT = "4c7b5074be94fa83a1cd98e9c752083ad04a6e21";
const DRAGONFLY_URL = "https://raw.githubusercontent.com/df-mc/dragonfly";

const OUTPUT = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "json");

// New blocks and items take the fields Dragonfly does not have from these.
// Names are matched in order and the first match wins.
const ANALOGS = [
  [/^minecraft:(orange|red|yellow)_poplar_leaves$/, "minecraft:pale_oak_leaves"],
  [/poplar/, (name) => name.replace("poplar", "pale_oak")],
  [/^minecraft:music_disc_bounce$/, "minecraft:music_disc_creator"],
  [/^minecraft:straw_bed$/, "minecraft:bed"],
  [/^minecraft:item\.straw_bed$/, "minecraft:item.bed"],
  [/^minecraft:sulfur_spike$/, "minecraft:pointed_dripstone"],
  [/^minecraft:end_gateway$/, "minecraft:end_portal"],
  [/^minecraft:invisible_bedrock$/, "minecraft:bedrock"],
  [/^minecraft:moving_block$/, "minecraft:piston_arm_collision"],
  [/^minecraft:glowingobsidian$/, "minecraft:obsidian"],
  [/^minecraft:netherreactor$/, "minecraft:iron_block"],
  [/^minecraft:stonecutter$/, "minecraft:stonecutter_block"],
  [/^minecraft:deprecated_anvil$/, "minecraft:anvil"],
  [/^minecraft:deprecated_purpur_block_[12]$/, "minecraft:purpur_block"]
];

// Data driven blocks take the fields that are not in their definitions from
// a block of the same archetype.
const ARCHETYPE_ANALOGS = {
  stair_block: "minecraft:andesite_stairs",
  slab_block: "minecraft:andesite_slab",
  double_slab_block: "minecraft:andesite_double_slab",
  bush_block: "minecraft:deadbush",
  wall_foliage_block: "minecraft:glow_lichen"
};

// The largest stacks of items that have no components and nothing like them
// registered. Everything else stacks to 64.
const STACK_SIZES = [
  [/_(sword|shovel|pickaxe|axe|hoe|spear|helmet|chestplate|leggings|boots|boat|chest_boat|bucket)$/, 1],
  [/_(sign|hanging_sign|banner)$/, 16]
];

// --- NBT ------------------------------------------------------------------

// Tags are { type, value }. Compounds hold an object of tags, in order, and
// lists hold { elementType, items }. "network" is the varint form Dragonfly
// stores most files in, and "le" the little endian form of the rest.
const Tag = {
  End: 0,
  Byte: 1,
  Short: 2,
  Int: 3,
  Long: 4,
  Float: 5,
  Double: 6,
  ByteArray: 7,
  String: 8,
  List: 9,
  Compound: 10,
  IntArray: 11,
  LongArray: 12
};

class NbtReader {
  constructor(buffer, format) {
    this.buffer = buffer;
    this.offset = 0;
    this.network = format === "network";
  }

  get done() {
    return this.offset >= this.buffer.length;
  }

  byte() {
    return this.buffer[this.offset++];
  }

  varuint() {
    let value = 0;
    let shift = 0;
    let byte;
    do {
      byte = this.byte();
      value += (byte & 0x7f) * 2 ** shift;
      shift += 7;
    } while (byte & 0x80);
    return value;
  }

  varuint64() {
    let value = 0n;
    let shift = 0n;
    let byte;
    do {
      byte = this.byte();
      value |= BigInt(byte & 0x7f) << shift;
      shift += 7n;
    } while (byte & 0x80);
    return value;
  }

  int() {
    if (this.network) {
      const value = this.varuint();
      return (value % 2 === 0 ? value / 2 : -(value + 1) / 2) | 0;
    }
    const value = this.buffer.readInt32LE(this.offset);
    this.offset += 4;
    return value;
  }

  long() {
    if (this.network) {
      const value = this.varuint64();
      return (value >> 1n) ^ -(value & 1n);
    }
    const value = this.buffer.readBigInt64LE(this.offset);
    this.offset += 8;
    return value;
  }

  string() {
    let length;
    if (this.network) length = this.varuint();
    else {
      length = this.buffer.readUInt16LE(this.offset);
      this.offset += 2;
    }
    const value = this.buffer.toString("utf8", this.offset, this.offset + length);
    this.offset += length;
    return value;
  }

  payload(type) {
    const buffer = this.buffer;
    switch (type) {
      case Tag.Byte:
        return buffer.readInt8(this.offset++);
      case Tag.Short: {
        const value = buffer.readInt16LE(this.offset);
        this.offset += 2;
        return value;
      }
      case Tag.Int:
        return this.int();
      case Tag.Long:
        return this.long();
      case Tag.Float: {
        const value = buffer.readFloatLE(this.offset);
        this.offset += 4;
        return value;
      }
      case Tag.Double: {
        const value = buffer.readDoubleLE(this.offset);
        this.offset += 8;
        return value;
      }
      case Tag.ByteArray: {
        const length = this.int();
        const value = Buffer.from(buffer.subarray(this.offset, this.offset + length));
        this.offset += length;
        return value;
      }
      case Tag.String:
        return this.string();
      case Tag.List: {
        const elementType = this.byte();
        const length = this.int();
        const items = [];
        for (let i = 0; i < length; i++) items.push(this.payload(elementType));
        return { elementType, items };
      }
      case Tag.Compound: {
        const value = {};
        for (;;) {
          const type = this.byte();
          if (type === Tag.End) return value;
          const name = this.string();
          value[name] = { type, value: this.payload(type) };
        }
      }
      case Tag.IntArray:
      case Tag.LongArray: {
        const length = this.int();
        const value = [];
        for (let i = 0; i < length; i++) value.push(type === Tag.IntArray ? this.int() : this.long());
        return value;
      }
      default:
        throw new Error(`Unknown NBT tag type ${type} at ${this.offset}`);
    }
  }

  root() {
    const type = this.byte();
    this.string();
    return { type, value: this.payload(type) };
  }
}

class NbtWriter {
  parts = [];

  push(buffer) {
    this.parts.push(buffer);
  }

  number(method, size, value) {
    const buffer = Buffer.alloc(size);
    buffer[method](value);
    this.push(buffer);
  }

  string(value) {
    const data = Buffer.from(value, "utf8");
    this.number("writeUInt16LE", 2, data.length);
    this.push(data);
  }

  payload(type, value) {
    switch (type) {
      case Tag.Byte:
        return this.number("writeInt8", 1, value);
      case Tag.Short:
        return this.number("writeInt16LE", 2, value);
      case Tag.Int:
        return this.number("writeInt32LE", 4, value);
      case Tag.Long:
        return this.number("writeBigInt64LE", 8, BigInt(value));
      case Tag.Float:
        return this.number("writeFloatLE", 4, value);
      case Tag.Double:
        return this.number("writeDoubleLE", 8, value);
      case Tag.ByteArray:
        this.number("writeInt32LE", 4, value.length);
        return this.push(value);
      case Tag.String:
        return this.string(value);
      case Tag.List:
        this.number("writeUInt8", 1, value.elementType);
        this.number("writeInt32LE", 4, value.items.length);
        for (const item of value.items) this.payload(value.elementType, item);
        return;
      case Tag.Compound:
        for (const [name, tag] of Object.entries(value)) {
          this.number("writeUInt8", 1, tag.type);
          this.string(name);
          this.payload(tag.type, tag.value);
        }
        return this.number("writeUInt8", 1, Tag.End);
      case Tag.IntArray:
      case Tag.LongArray:
        this.number("writeInt32LE", 4, value.length);
        for (const item of value) this.payload(type === Tag.IntArray ? Tag.Int : Tag.Long, item);
        return;
      default:
        throw new Error(`Unknown NBT tag type ${type}`);
    }
  }
}

// A compound as little endian NBT with an empty root name, the form the
// server reads properties and item user data in.
function writeCompound(value) {
  const writer = new NbtWriter();
  writer.number("writeUInt8", 1, Tag.Compound);
  writer.string("");
  writer.payload(Tag.Compound, value);
  return Buffer.concat(writer.parts);
}

// A tag without its types, for reading values.
function plain({ type, value }) {
  if (type === Tag.Compound) return Object.fromEntries(Object.entries(value).map(([key, tag]) => [key, plain(tag)]));
  if (type === Tag.List) return value.items.map((item) => plain({ type: value.elementType, value: item }));
  return value;
}

// --- Binary helpers -------------------------------------------------------

class ByteWriter {
  parts = [];

  varuint(value) {
    const bytes = [];
    do {
      let byte = value % 128;
      value = Math.floor(value / 128);
      if (value > 0) byte |= 0x80;
      bytes.push(byte);
    } while (value > 0);
    this.parts.push(Buffer.from(bytes));
  }

  zigzag(value) {
    this.varuint(value >= 0 ? value * 2 : -value * 2 - 1);
  }

  number(method, size, value) {
    const buffer = Buffer.alloc(size);
    buffer[method](value);
    this.parts.push(buffer);
  }

  bytes(buffer) {
    this.parts.push(buffer);
  }

  buffer() {
    return Buffer.concat(this.parts);
  }
}

// Reads a network item instance descriptor, base64.
function readInstance(base64) {
  const buffer = Buffer.from(base64, "base64");
  let offset = 0;
  const varuint = () => {
    let value = 0;
    let shift = 0;
    let byte;
    do {
      byte = buffer[offset++];
      value += (byte & 0x7f) * 2 ** shift;
      shift += 7;
    } while (byte & 0x80);
    return value;
  };
  const zigzag = () => {
    const value = varuint();
    return value % 2 === 0 ? value / 2 : -(value + 1) / 2;
  };

  const network = zigzag();
  const count = buffer.readUInt16LE(offset);
  offset += 2;
  const meta = varuint();
  const block = zigzag();
  const length = varuint();
  const extras = buffer.subarray(offset, offset + length);
  return { network, count, meta, block, extras };
}

// --- Sources --------------------------------------------------------------

async function loadDragonfly(checkout) {
  const read = async (path) => {
    if (checkout) return readFileSync(join(checkout, path));
    const response = await fetch(`${DRAGONFLY_URL}/${DRAGONFLY_COMMIT}/${path}`);
    if (!response.ok) throw new Error(`Failed to download ${path}: ${response.status}`);
    return Buffer.from(await response.arrayBuffer());
  };

  // block_states.nbt holds one root compound per block state.
  const states = [];
  const reader = new NbtReader(await read("server/world/block_states.nbt"), "network");
  while (!reader.done) states.push(reader.root().value);

  const dataDriven = new NbtReader(await read("server/world/data_driven_blocks.nbt"), "le").root();
  const items = new NbtReader(await read("server/world/vanilla_items.nbt"), "network").root();
  const creative = new NbtReader(await read("server/item/creative/creative_items.nbt"), "network").root();
  const recipes = new NbtReader(await read("server/item/recipe/crafting_data.nbt"), "network").root();

  return {
    states,
    dataDriven: dataDriven.value.blocks.value.items,
    items: items.value,
    creative: creative.value,
    recipes: recipes.value
  };
}

function readJson(name) {
  return JSON.parse(readFileSync(join(OUTPUT, name), "utf8"));
}

function writeJson(name, value) {
  writeFileSync(join(OUTPUT, name), JSON.stringify(value, null, 2));
}

function analogOf(name, known) {
  for (const [pattern, analog] of ANALOGS) {
    if (!pattern.test(name)) continue;
    const result = typeof analog === "function" ? analog(name) : analog;
    if (known.has(result)) return result;
  }
  return null;
}

// Rounds a 32-bit float to the decimal it was written as.
function float(value) {
  return Number(value.toPrecision(7));
}

// --- Blocks ---------------------------------------------------------------

// The network ID of a block state when the IDs are hashes: FNV-1a over the
// state as little endian NBT, as BlockPermutation.hash computes it.
function hashBlock(name, states) {
  const sorted = {};
  for (const key of Object.keys(states).sort()) sorted[key] = states[key];

  const buffer = writeCompound({
    name: { type: Tag.String, value: name },
    states: { type: Tag.Compound, value: sorted }
  });

  let hash = 0x81_1c_9d_c5;
  for (const byte of buffer) hash = Math.imul(hash ^ byte, 0x01_00_01_93);
  return hash | 0;
}

function stateValue({ type, value }) {
  if (type !== Tag.Byte) return value;
  if (value !== 0 && value !== 1) throw new Error(`Byte state with value ${value}`);
  return value === 1;
}

function generateBlocks(dragonfly) {
  // Every block's states, in Dragonfly's order. The first is the default.
  const palette = new Map();
  for (const state of dragonfly.states) {
    const name = state.name.value;
    if (!palette.has(name)) palette.set(name, []);
    palette.get(name).push(state.states.value);
  }

  const definitions = new Map(
    dragonfly.dataDriven.map((block) => [block.name.value, block.components.value])
  );

  const oldPermutations = new Map(readJson("block_permutations.json").map((permutation) => [permutation.hash, permutation]));
  const oldTypes = new Map(readJson("block_types.json").map((type) => [type.identifier, type]));
  const oldMetadata = readJson("block_metadata.json");
  const oldMetadataByName = new Map(oldMetadata.map((entry) => [entry.identifier, entry]));
  const oldStates = new Map(readJson("block_states.json").map((state) => [state.identifier, state]));

  const names = [...palette.keys()].sort();

  // Block permutations, by identifier. Blocks whose states did not change
  // keep their order, since a partial state resolves to the first permutation
  // it matches, and the others take Dragonfly's. Both start with the default.
  const oldOrder = new Map([...oldPermutations.keys()].map((hash, index) => [hash, index]));
  const permutations = [];
  for (const name of names) {
    const entries = palette.get(name).map((states) => {
      const state = {};
      for (const key of Object.keys(states).sort()) state[key] = stateValue(states[key]);
      return { identifier: name, hash: hashBlock(name, states), state };
    });
    if (entries.every((entry) => oldOrder.has(entry.hash)))
      entries.sort((a, b) => oldOrder.get(a.hash) - oldOrder.get(b.hash));
    permutations.push(...entries);
  }

  // Block states and their values. Existing values keep their order.
  const stateValues = new Map();
  for (const states of [...palette.values()].flat()) {
    for (const [key, tag] of Object.entries(states)) {
      const kind = tag.type === Tag.Byte ? "bool" : tag.type === Tag.Int ? "int" : "string";
      if (!stateValues.has(key)) stateValues.set(key, { kind, values: new Set() });
      stateValues.get(key).values.add(stateValue(tag));
    }
  }
  const blockStates = [...stateValues.keys()].sort().map((identifier) => {
    const { kind, values } = stateValues.get(identifier);
    const old = oldStates.get(identifier)?.values.filter((value) => values.has(value)) ?? [];
    const added = [...values].filter((value) => !old.includes(value));
    if (kind !== "string") added.sort((a, b) => Number(a) - Number(b));
    return { identifier, type: kind, values: [...old, ...added] };
  });

  // Where a block without data takes it from.
  const sourceOf = (name) => {
    const definition = definitions.get(name);
    if (definition) {
      const archetype = plain(definition.vanilla_block_data).block_archetype ?? {};
      const kind = archetype.is_double ? "double_slab_block" : archetype.type;
      // Stairs and slabs look like the block they are made of.
      const base = archetype.base_block ?? name.replace(/_(double_slab|slab|stairs)$/, "");
      return { analog: ARCHETYPE_ANALOGS[kind] ?? null, base, definition };
    }
    return { analog: analogOf(name, oldTypes), base: null, definition: null };
  };

  const added = { types: [], metadata: [] };
  const types = names.map((identifier) => {
    const states = Object.keys(palette.get(identifier)[0]).sort();
    let type = oldTypes.get(identifier);

    if (type) type = { ...type, states };
    else {
      const { analog, definition } = sourceOf(identifier);
      const like = analog ? oldTypes.get(analog) : null;
      if (analog && !like) throw new Error(`Block ${identifier}'s analog ${analog} does not exist`);
      const rename = (tag) => tag.replace("pale_oak", "poplar");

      type = {
        identifier,
        components: like?.components ?? [],
        tags: definition ? (definition.blockTags ? plain(definition.blockTags) : []) : (like?.tags ?? []).map(rename),
        air: like?.air ?? false,
        liquid: like?.liquid ?? false,
        solid: like?.solid ?? true,
        states
      };
      added.types.push(`${identifier}${analog ? ` (like ${analog})` : ""}`);
    }

    // The client only knows data driven blocks from their definitions.
    const definition = definitions.get(identifier);
    if (definition) type.properties = writeCompound(definition).toString("base64");
    else delete type.properties;

    return type;
  });

  const metadata = oldMetadata.filter((entry) => palette.has(entry.identifier));
  for (const identifier of names) {
    if (oldMetadataByName.has(identifier)) continue;
    const { analog, base, definition } = sourceOf(identifier);
    const like = oldMetadataByName.get(base) ?? oldMetadataByName.get(analog);
    if (!like) continue;

    const mining = definition && plain(definition.components)["minecraft:destructible_by_mining"];
    metadata.push({
      identifier,
      hardness: mining?.value !== undefined ? float(mining.value) : like.hardness,
      friction: like.friction,
      mapColor: like.mapColor
    });
    added.metadata.push(identifier);
  }

  writeJson("block_permutations.json", permutations);
  writeJson("block_states.json", blockStates);
  writeJson("block_types.json", types);
  writeJson("block_metadata.json", metadata);

  console.log(`Blocks: ${types.length} types (${added.types.length} new), ${permutations.length} permutations`);
  for (const line of added.types) console.log(`  + ${line}`);
  console.log(`Block metadata: ${metadata.length} entries (${added.metadata.length} new)`);

  return { palette, oldPermutations };
}

// --- Items ----------------------------------------------------------------

function generateItems(dragonfly) {
  const items = new Map(Object.entries(dragonfly.items).map(([name, tag]) => [name, plain(tag)]));
  const creative = new Set(dragonfly.creative.items.value.items.map((item) => item.name.value));

  const oldMetadata = readJson("item_metadata.json");
  const oldTypes = readJson("item_types.json");
  const oldMetadataByName = new Map(oldMetadata.map((entry) => [entry.identifier, entry]));
  const oldTypesByName = new Map(oldTypes.map((type) => [type.identifier, type]));

  const metadataOf = (identifier) => {
    const item = dragonfly.items[identifier].value;
    return {
      identifier,
      networkId: item.runtime_id.value,
      isComponentBased: item.component_based.value === 1,
      itemVersion: item.version.value,
      properties: writeCompound(item.data?.value ?? {}).toString("base64")
    };
  };

  // Existing entries keep their order, and new ones follow.
  const names = [...items.keys()].sort();
  const metadata = [
    ...oldMetadata.filter((entry) => items.has(entry.identifier)).map((entry) => metadataOf(entry.identifier)),
    ...names.filter((name) => !oldMetadataByName.has(name)).map(metadataOf)
  ];

  const types = oldTypes.filter((type) => items.has(type.identifier));
  const added = [];
  for (const identifier of names) {
    if (oldTypesByName.has(identifier) || oldMetadataByName.has(identifier)) continue;

    // New items are registered like the items they are like, or when the
    // creative inventory has them.
    const analog = analogOf(identifier, oldMetadataByName);
    const like = analog ? oldTypesByName.get(analog) : null;
    if (analog ? !like : !creative.has(identifier)) continue;

    const components = items.get(identifier).data?.components;
    const maxAmount =
      like?.maxAmount ??
      components?.item_properties?.max_stack_size ??
      STACK_SIZES.find(([pattern]) => pattern.test(identifier))?.[1] ??
      64;

    types.push({
      identifier,
      tags: like ? like.tags.map((tag) => tag.replace("pale_oak", "poplar")) : (components?.item_tags ?? []),
      stackable: maxAmount > 1,
      maxAmount
    });
    added.push(`${identifier}${analog ? ` (like ${analog})` : ""}`);
  }

  writeJson("item_metadata.json", metadata);
  writeJson("item_types.json", types);

  const removed = oldMetadata.filter((entry) => !items.has(entry.identifier)).map((entry) => entry.identifier);
  console.log(`Items: ${metadata.length} (${metadata.length - oldMetadata.length + removed.length} new, ${removed.length} removed), ${types.length} registered (${added.length} new)`);
  for (const line of added) console.log(`  + ${line}`);
  for (const name of removed) console.log(`  - ${name}`);

  return { items };
}

// --- Item instances -------------------------------------------------------

function createInstances({ palette, oldPermutations }, { items }) {
  const shield = items.get("minecraft:shield").runtime_id;

  // Whether an item places the block of its own name. Blocks with an item of
  // their own (minecraft:item.bed for the bed) and doors and hanging signs,
  // which share their block's name, are placed as items.
  const isBlockItem = (name) => {
    if (!palette.has(name) || name === "minecraft:air") return false;
    if (items.has(name.replace("minecraft:", "minecraft:item."))) return false;
    return !(name.endsWith("_door") && !name.endsWith("trapdoor")) && !name.endsWith("_hanging_sign");
  };

  // A block state of the palette from a possibly partial one: missing states
  // take the default state's values.
  const blockState = (name, properties) => {
    const states = palette.get(name);
    if (!properties || Object.keys(properties).length === 0) return states[0];
    const match = states.find((state) =>
      Object.entries(properties).every(([key, tag]) => state[key]?.value === tag.value)
    );
    if (!match) throw new Error(`No block state of ${name} matches ${JSON.stringify(plain({ type: Tag.Compound, value: properties }))}`);
    return match;
  };

  // The state of the palette closest to an older one of the same block:
  // states the block no longer has are dropped, and new ones take the default
  // state's values.
  const upgrade = (name, old) => {
    const states = palette.get(name);
    if (!states) throw new Error(`Block ${name} no longer exists`);
    const [fallback] = states;
    const matches = (state, strict) =>
      Object.entries(state).every(([key, tag]) =>
        key in old ? stateValue(tag) === old[key] : !strict || tag.value === fallback[key].value
      );
    return states.find((state) => matches(state, true)) ?? states.find((state) => matches(state, false)) ?? fallback;
  };

  const write = (network, count, meta, blockId, extras) => {
    const writer = new ByteWriter();
    writer.zigzag(network);
    writer.number("writeUInt16LE", 2, count);
    writer.varuint(meta);
    writer.zigzag(blockId);
    writer.varuint(extras.length);
    writer.bytes(extras);
    return writer.buffer().toString("base64");
  };

  // A network item instance descriptor, base64. Dragonfly gives some items
  // that are not placed as blocks a block state, which the client does not
  // expect, so only block items have one.
  const create = ({ name, count = 1, meta = 0, block, nbt }) => {
    const item = items.get(name);
    if (!item) throw new Error(`Unknown item ${name}`);

    const blockId = isBlockItem(name) ? hashBlock(name, blockState(name, block)) : 0;

    const userData = new ByteWriter();
    if (nbt && Object.keys(nbt).length > 0) {
      userData.number("writeUInt16LE", 2, 0xff_ff);
      userData.number("writeInt8", 1, 1);
      userData.bytes(writeCompound(nbt));
    } else userData.number("writeUInt16LE", 2, 0);
    userData.number("writeInt32LE", 4, 0);
    userData.number("writeInt32LE", 4, 0);
    if (item.runtime_id === shield) userData.number("writeBigInt64LE", 8, 0n);

    return write(item.runtime_id, count, meta, blockId, userData.buffer());
  };

  // An existing descriptor with this version's network IDs.
  const reencode = (base64, name) => {
    const item = items.get(name);
    if (!item) throw new Error(`Unknown item ${name}`);

    const { count, meta, block, extras } = readInstance(base64);
    let blockId = 0;
    if (block !== 0) {
      const permutation = oldPermutations.get(block);
      if (!permutation) throw new Error(`Unknown block network ID ${block} of ${name}`);
      blockId = hashBlock(permutation.identifier, upgrade(permutation.identifier, permutation.state));
    }

    return write(item.runtime_id, count, meta, blockId, extras);
  };

  return { create, reencode };
}

// --- Creative inventory ---------------------------------------------------

function generateCreative(dragonfly, { create }) {
  const groups = plain(dragonfly.creative.groups).map((group) => ({
    category: group.category,
    name: group.name,
    icon: group.icon?.name || "minecraft:air"
  }));

  const content = dragonfly.creative.items.value.items.map((entry) => {
    const name = entry.name.value;
    return {
      type: name,
      instance: create({
        name,
        meta: entry.meta?.value ?? 0,
        block: entry.block_properties?.value,
        nbt: entry.nbt?.value
      }),
      groupIndex: entry.group_index?.value ?? 0
    };
  });

  writeJson("creative_groups.json", groups);
  writeJson("creative_content.json", content);
  console.log(`Creative inventory: ${groups.length} groups, ${content.length} items`);
}

// --- Recipes --------------------------------------------------------------

// Recipes are matched by their station, ingredients and results. Ingredient
// aliases match the item they alias, as Dragonfly lists them. Metadata is not
// compared: Dragonfly turned the metadata of some items into block states
// (the bed's color into the bed block's direction), so it no longer has it.
function ingredientKey(ingredient) {
  if (ingredient.tag) return `#${ingredient.tag}`;
  return ingredient.alias ?? ingredient.type ?? ingredient.name;
}

function recipeKey(kind, station, ingredients, results) {
  return [kind, station, ingredients.map(ingredientKey).sort().join(","), results.sort().join(",")].join("|");
}

function generateRecipes(dragonfly, { create, reencode }) {
  const { shaped, shapeless } = dragonfly.recipes;

  // Dragonfly's recipes, converted to the files' form.
  const resultants = (output) =>
    output.items.map((result) => {
      const name = result.name.value;
      return {
        type: name,
        instance: create({
          name,
          count: result.count?.value ?? 1,
          meta: result.meta?.value ?? 0,
          block: result.block?.value.states.value,
          nbt: result.data?.value
        })
      };
    });
  const resultKeys = (output) => output.items.map((tag) => `${tag.name.value}*${tag.count?.value ?? 1}`);
  const ingredient = (tag) =>
    tag.tag ? { tag: tag.tag.value } : { type: tag.name.value, metadata: tag.meta?.value ?? 0 };
  const isEmpty = (tag) => !tag.tag && (tag.name?.value ?? "minecraft:air") === "minecraft:air";

  const converted = [];
  for (const recipe of shaped.value.items) {
    const width = recipe.width.value;
    const height = recipe.height.value;
    const cells = recipe.input.value.items;
    const key = {};
    const letters = new Map();
    const pattern = [];
    for (let row = 0; row < height; row++) {
      let line = "";
      for (let column = 0; column < width; column++) {
        const cell = cells[row * width + column];
        if (isEmpty(cell)) {
          line += " ";
          continue;
        }
        const descriptor = ingredient(cell);
        const id = JSON.stringify(descriptor);
        if (!letters.has(id)) {
          const letter = String.fromCharCode(65 + letters.size);
          letters.set(id, letter);
          key[letter] = descriptor;
        }
        line += letters.get(id);
      }
      pattern.push(line);
    }
    while (pattern.length < 3) pattern.push("");

    const inputs = cells.filter((cell) => !isEmpty(cell)).map(ingredient);
    converted.push({
      kind: "shaped",
      key: recipeKey("shaped", recipe.block.value, inputs, resultKeys(recipe.output.value)),
      recipe: {
        priority: recipe.priority?.value ?? 0,
        tag: recipe.block.value,
        symmetrical: true,
        pattern,
        key,
        resultants: resultants(recipe.output.value)
      }
    });
  }
  for (const recipe of shapeless.value.items) {
    const inputs = recipe.input.value.items.filter((cell) => !isEmpty(cell)).map(ingredient);
    converted.push({
      kind: "shapeless",
      key: recipeKey("shapeless", recipe.block.value, inputs, resultKeys(recipe.output.value)),
      recipe: {
        priority: recipe.priority?.value ?? 0,
        tag: recipe.block.value,
        ingredients: inputs,
        resultants: resultants(recipe.output.value)
      }
    });
  }

  const byKey = new Map();
  for (const entry of converted) {
    if (!byKey.has(entry.key)) byKey.set(entry.key, []);
    byKey.get(entry.key).push(entry);
  }

  const output = { shaped: [], shapeless: [] };
  const identifiers = new Set();
  const unique = (identifier) => {
    let candidate = identifier;
    for (let index = 2; identifiers.has(candidate); index++) candidate = `${identifier}_${index}`;
    identifiers.add(candidate);
    return candidate;
  };

  // Existing recipes Dragonfly has are kept, with this version's network IDs.
  const stats = { kept: 0, removed: [], added: 0 };
  for (const kind of ["shaped", "shapeless"]) {
    for (const recipe of readJson(`${kind}.json`)) {
      const inputs =
        kind === "shaped"
          ? recipe.pattern.join("").split("").filter((cell) => cell !== " ").map((cell) => recipe.key[cell])
          : recipe.ingredients;
      const results = recipe.resultants.map((result) => `${result.type}*${readInstance(result.instance).count}`);
      if (!byKey.get(recipeKey(kind, recipe.tag, inputs, results))?.shift()) {
        stats.removed.push(recipe.identifier);
        continue;
      }

      const resultants = recipe.resultants.map((result) => ({
        type: result.type,
        instance: reencode(result.instance, result.type)
      }));
      output[kind].push({ ...recipe, identifier: unique(recipe.identifier), resultants });
      stats.kept++;
    }
  }

  // Dragonfly's other recipes are new.
  for (const entry of converted) {
    if (!byKey.get(entry.key)?.includes(entry)) continue;
    const result = entry.recipe.resultants[0].type.replace("minecraft:", "");
    const first = entry.recipe.ingredients?.[0] ?? Object.values(entry.recipe.key)[0];
    const source = (first.tag ?? first.type).replace("minecraft:", "");
    const name =
      entry.recipe.tag === "crafting_table" ? `minecraft:${result}_from_${source}` : `minecraft:${result}_from_${source}_${entry.recipe.tag}`;
    output[entry.kind].push({ identifier: unique(name), ...entry.recipe });
    stats.added++;
  }

  writeJson("shaped.json", output.shaped);
  writeJson("shapeless.json", output.shapeless);
  console.log(`Recipes: ${output.shaped.length} shaped, ${output.shapeless.length} shapeless (${stats.kept} kept, ${stats.added} new, ${stats.removed.length} removed)`);
  for (const identifier of stats.removed) console.log(`  - ${identifier}`);
}

// --- Main -----------------------------------------------------------------

const dragonfly = await loadDragonfly(process.argv[2]);
const blocks = generateBlocks(dragonfly);
const items = generateItems(dragonfly);
const instances = createInstances(blocks, items);
generateCreative(dragonfly, instances);
generateRecipes(dragonfly, instances);
