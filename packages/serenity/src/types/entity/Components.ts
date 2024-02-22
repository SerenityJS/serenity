import type { EntityCursorComponent, EntityInventoryComponent } from '../../entity/index.js';

interface EntityComponents {
	'minecraft:cursor': EntityCursorComponent;
	'minecraft:inventory': EntityInventoryComponent;
}

export type { EntityComponents };
