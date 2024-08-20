import type { BlockCoordinates } from "@serenityjs/protocol";
import type { ItemUseCause } from "../../enums";

interface ItemUseOptions {
	cause: ItemUseCause;
	blockPostion?: BlockCoordinates;
}

export type { ItemUseOptions };
