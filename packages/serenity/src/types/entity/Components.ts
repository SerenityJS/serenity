import type { EntityCursorComponent, EntityInventoryComponent, EntityMovementComponent } from '../../entity/index.js';

interface EntityComponents {
	'minecraft:cursor': EntityCursorComponent;
	'minecraft:inventory': EntityInventoryComponent;
	'minecraft:movement': EntityMovementComponent;
}

export type { EntityComponents };
