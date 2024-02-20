import { EntityInventory } from '../entity/index.js';
import type { Item } from '../world/index.js';
import type { Player } from './Player.js';

class PlayerInventory extends EntityInventory {
	protected readonly player: Player;

	public readonly hotbar: Map<number, Item>;

	public cursor: Item | null;

	public constructor(player: Player) {
		super(player);
		this.player = player;
		this.hotbar = new Map();
		this.cursor = null;
	}

	public getHotbar(slot: number): Item | null {
		return this.hotbar.get(slot) ?? null;
	}

	public setHotbar(slot: number, item: Item): void {
		this.hotbar.set(slot, item);
	}
}

export { PlayerInventory };
