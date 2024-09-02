import { CustomEnum } from "@serenityjs/command";

class TagEnum extends CustomEnum {
	public static readonly identifier = "tag_operation";
	public static readonly options = ["add", "remove", "list"];
}

export { TagEnum };
