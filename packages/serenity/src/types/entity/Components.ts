import type {
	EntityCursorComponent,
	EntityHealthComponent,
	EntityInventoryComponent,
	EntityMovementComponent,
} from '../../entity/index.js';

interface EntityComponents {
	'minecraft:cursor': EntityCursorComponent;
	'minecraft:health': EntityHealthComponent;
	'minecraft:inventory': EntityInventoryComponent;
	'minecraft:movement': EntityMovementComponent;
}

export type { EntityComponents };
