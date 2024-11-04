import { BlockFace, Vector3f } from "@serenityjs/protocol";

import { BlockEntry } from "../world";

interface BlockProperties {
  entry?: BlockEntry;
}

interface BlockInteractionOptions {
  clickPosition: Vector3f;
  face: BlockFace;
}

export { BlockProperties, BlockInteractionOptions };
