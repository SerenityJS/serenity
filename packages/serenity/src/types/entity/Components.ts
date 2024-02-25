import type {
	EntityCursorComponent,
	EntityHealthComponent,
	EntityInventoryComponent,
	EntityLavaMovementComponent,
	EntityMovementComponent,
	EntityUnderwaterMovementComponent,
} from '../../entity/index.js';

interface EntityComponents {
	'minecraft:cursor': EntityCursorComponent;
	'minecraft:health': EntityHealthComponent;
	'minecraft:inventory': EntityInventoryComponent;
	'minecraft:lava_movement': EntityLavaMovementComponent;
	'minecraft:movement': EntityMovementComponent;
	'minecraft:underwater_movement': EntityUnderwaterMovementComponent;
}

export type { EntityComponents };
