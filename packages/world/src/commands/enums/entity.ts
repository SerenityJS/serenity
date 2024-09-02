import { CustomEnum } from "@serenityjs/command";
import { EntityType } from "@serenityjs/entity";

const identifiers = EntityType.getAll().map((entity) =>
	entity.identifier.startsWith("minecraft:")
		? entity.identifier.slice(10)
		: entity.identifier
);

class EntityEnum extends CustomEnum {
	public static readonly identifier = "entities";
	public static readonly options = identifiers;
}

export { EntityEnum };
