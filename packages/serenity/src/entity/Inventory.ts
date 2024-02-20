import type { Item } from '../world/index.js';
import type { Entity } from './Entity.js';

class EntityInventory {
	protected readonly entity: Entity;

	public readonly slots: Map<number, Item>;

	public constructor(entity: Entity) {
		this.entity = entity;
		this.slots = new Map();
	}

	public setSlot(slot: number, item: Item): void {
		this.slots.set(slot, item);
	}

	public getSlot(slot: number): Item | undefined {
		return this.slots.get(slot);
	}
}

export { EntityInventory };
