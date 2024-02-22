import { EntityContainer } from '../../entity/index.js';
import type { ItemType } from './Type.js';

class Item {
	protected readonly properties: Map<string, number | string>; // TODO: Create a component system for items

	public readonly type: ItemType;

	public container: EntityContainer | null;

	public constructor(type: ItemType, amount: number) {
		this.properties = new Map();
		this.type = type;
		this.container = null;

		// Setting item properties
		this.properties.set('amount', amount);
		this.properties.set('nametag', String());
	}

	public getSlot(): number | null {
		if (this.container === null) return null;

		return this.container.storage.indexOf(this);
	}

	public get amount(): number {
		return this.properties.get('amount') as number;
	}

	public set amount(value: number) {
		this.properties.set('amount', value);

		if (this.container === null) return;

		EntityContainer.networkSetItem(this.container, this);
	}

	public get nametag(): string {
		return this.properties.get('nametag') as string;
	}

	public set nametag(value: string) {
		this.properties.set('nametag', value);

		if (this.container === null) return;

		EntityContainer.networkSetItem(this.container, this);
	}
}

export { Item };
