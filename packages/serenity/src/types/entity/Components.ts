import type {
	EntityAlwaysShowNametagComponent,
	EntityCanShowNametagComponent,
	EntityCursorComponent,
	EntityHealthComponent,
	EntityInventoryComponent,
	EntityLavaMovementComponent,
	EntityMovementComponent,
	EntityNametagComponent,
	EntityScaleComponent,
	EntityUnderwaterMovementComponent,
	EntityVariantComponent,
} from '../../entity/index.js';

interface EntityComponents {
	'minecraft:always_show_nametag': EntityAlwaysShowNametagComponent;
	'minecraft:can_show_nametag': EntityCanShowNametagComponent;
	'minecraft:cursor': EntityCursorComponent;
	'minecraft:health': EntityHealthComponent;
	'minecraft:inventory': EntityInventoryComponent;
	'minecraft:lava_movement': EntityLavaMovementComponent;
	'minecraft:movement': EntityMovementComponent;
	'minecraft:nametag': EntityNametagComponent;
	'minecraft:scale': EntityScaleComponent;
	'minecraft:underwater_movement': EntityUnderwaterMovementComponent;
	'minecraft:variant': EntityVariantComponent;
}

export type { EntityComponents };
