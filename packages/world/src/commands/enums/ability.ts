import { CustomEnum } from "@serenityjs/command";
import { AbilitySet } from "@serenityjs/protocol";

const identifiers = Object.values(AbilitySet);

class AbilityEnum extends CustomEnum {
	public static readonly name = "ability";
	public static readonly options = identifiers;
}

export { AbilityEnum };
