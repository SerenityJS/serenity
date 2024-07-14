import { CustomEnum } from "@serenityjs/command";

class BoolEnum extends CustomEnum {
	public static readonly name = "bool";
	public static readonly options = ["true", "false"];
}

export { BoolEnum };
