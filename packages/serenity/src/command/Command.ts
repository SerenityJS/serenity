import type { Player } from '../index.js';

class Command {
	public name: string;
	public description: string;
	public permission?: string[] | string;
	public aliases?: string[];

	public constructor(name: string, description: string, permission?: string[] | string, aliases?: string[]) {
		this.name = name;
		this.description = description;
		this.permission = permission;
		this.aliases = aliases;
	}

	public async execute(player: Player, args: any[]): Promise<any> {}
}

export { Command };
