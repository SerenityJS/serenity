import type { BlockPosition } from "@serenityjs/protocol";
import type { ItemUseCause } from "../../enums";

interface ItemUseOptions {
	cause: ItemUseCause;
	blockPostion?: BlockPosition;
}

export type { ItemUseOptions };
