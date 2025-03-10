import { BlockType } from "../../../block";

import { CustomEnum } from ".";

const identifiers = BlockType.getAll().map((block) =>
  block.identifier.startsWith("minecraft:")
    ? block.identifier.slice(10)
    : block.identifier
);

class BlockEnum extends CustomEnum {
  public static readonly identifier = "blocks";
  public static readonly options = identifiers;
}

export { BlockEnum };
