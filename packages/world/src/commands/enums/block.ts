import { BlockType } from "@serenityjs/block";
import { CustomEnum } from "@serenityjs/command";

const identifiers = BlockType.getAll().map((block) =>
	block.identifier.startsWith("minecraft:")
		? block.identifier.slice(10)
		: block.identifier
);

class BlockEnum extends CustomEnum {
	public static readonly name = "block";
	public static readonly options = identifiers;
}

export { BlockEnum };
