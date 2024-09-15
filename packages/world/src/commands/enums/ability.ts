import { CustomEnum } from "@serenityjs/command";
import { AbilityIndex } from "@serenityjs/protocol";

const identifiers = Object.values(AbilityIndex).filter(
	(id) => typeof id === "string"
) as Array<string>;

class AbilityEnum extends CustomEnum {
	public static readonly name = "ability";
	public static readonly options = identifiers;
}

export { AbilityEnum };
