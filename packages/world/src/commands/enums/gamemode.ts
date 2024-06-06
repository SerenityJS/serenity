import { CustomEnum } from "@serenityjs/command";

class GamemodeEnum extends CustomEnum {
	public static readonly name = "gamemode";
	public static readonly options = [
		"survival",
		"creative",
		"adventure",
		"spectator"
	];
}

export { GamemodeEnum };
