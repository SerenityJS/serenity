import type { BlockFace, Vector3f } from "@serenityjs/protocol";
import type { Player } from "../../player";

interface BlockUpdateOptions {
	readonly player?: Player;
	readonly blockFace?: BlockFace;
	readonly clickPosition?: Vector3f;
	readonly clearComponents?: boolean;
}

export { BlockUpdateOptions };
