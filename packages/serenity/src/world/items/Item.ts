import type { Player } from '../../player/index.js';
import type { ItemType } from './Type.js';

class Item {
	protected readonly player: Player;
	protected readonly properties: Map<string, number | string>;

	public readonly type: ItemType;

	public nametag: string;

	public constructor(player: Player, type: ItemType, amount: number, nametag?: string) {
		this.player = player;
		this.properties = new Map();
		this.type = type;

		// Setting item properties
		this.properties.set('amount', amount);
		this.nametag = nametag ?? String();
	}

	public get amount(): number {
		return this.properties.get('amount') as number;
	}

	public set amount(value: number) {
		this.properties.set('amount', value);
	}
}

export { Item };
