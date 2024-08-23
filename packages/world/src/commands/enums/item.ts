import { ItemType } from "@serenityjs/item";
import { CustomEnum } from "@serenityjs/command";

const identifiers = ItemType.getAll().map((item) =>
	item.identifier.startsWith("minecraft:")
		? item.identifier.slice(10)
		: item.identifier
);

class ItemEnum extends CustomEnum {
	public static readonly name = "block";
	public static readonly options = identifiers;
	public static readonly strict = false;
}

export { ItemEnum };
