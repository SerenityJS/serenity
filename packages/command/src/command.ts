import { Player } from "@serenityjs/world";

class Command {
	public name: string;
	public description: string;
	public permission?: Array<string> | string;
	public aliases?: Array<string>;

	public constructor(
		name: string,
		description: string,
		permission?: Array<string> | string,
		aliases?: Array<string>
	) {
		this.name = name;
		this.description = description;
		this.permission = permission;
		this.aliases = aliases;
	}

	public async execute(
		_player: Player,
		_arguments: Array<string>
	): Promise<undefined> {}
}

export { Command };
