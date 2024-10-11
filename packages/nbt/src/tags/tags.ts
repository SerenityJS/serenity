import { ByteTag } from "./byte";
import { ShortTag } from "./short";
import { IntTag } from "./int";
import { LongTag } from "./long";
import { FloatTag } from "./float";
import { DoubleTag } from "./double";
import { ByteListTag } from "./byte-list";
import { StringTag } from "./string";
import { CompoundTag } from "./compound";
import { ListTag } from "./list";

const NBT_TAGS = [
  ByteTag,
  ShortTag,
  IntTag,
  LongTag,
  FloatTag,
  DoubleTag,
  ByteListTag,
  StringTag,
  ListTag,
  CompoundTag
];

export { NBT_TAGS };
