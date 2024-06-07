import { CustomEnum } from "@serenityjs/command";
import { EntityType } from "@serenityjs/entity";

const identifiers = EntityType.getAll().map((block) => block.identifier);

class EntityEnum extends CustomEnum {
	public static readonly name = "entity";
	public static readonly options = identifiers;
}

export { EntityEnum };
