import type { Vector3f } from "@serenityjs/protocol";
import type { Player } from "../../player";

interface BlockUpdateOptions {
	readonly player?: Player;
	readonly clickPosition?: Vector3f;
}

export { BlockUpdateOptions };
