import type { FloatTag, ListTag, LongTag, StringTag } from "@serenityjs/nbt";

interface PlayerEntry {
	username: StringTag;
	identifier: StringTag;
	unique_id: LongTag;
	pos: ListTag<FloatTag>;
}

export { PlayerEntry };
