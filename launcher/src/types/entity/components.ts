import type {
	EntityAlwaysShowNametagComponent,
	EntityBreathingComponent,
	EntityCanShowNametagComponent,
	EntityCursorComponent,
	EntityHasGravityComponent,
	EntityHealthComponent,
	EntityInventoryComponent,
	EntityLavaMovementComponent,
	EntityMovementComponent,
	EntityNametagComponent,
	EntityScaleComponent,
	EntityUnderwaterMovementComponent,
	EntityVariantComponent
} from "../../entity";

interface EntityComponents {
	"minecraft:always_show_nametag": EntityAlwaysShowNametagComponent;
	"minecraft:breathing": EntityBreathingComponent;
	"minecraft:can_show_nametag": EntityCanShowNametagComponent;
	"minecraft:cursor": EntityCursorComponent;
	"minecraft:has_gravity": EntityHasGravityComponent;
	"minecraft:health": EntityHealthComponent;
	"minecraft:inventory": EntityInventoryComponent;
	"minecraft:lava_movement": EntityLavaMovementComponent;
	"minecraft:movement": EntityMovementComponent;
	"minecraft:nametag": EntityNametagComponent;
	"minecraft:scale": EntityScaleComponent;
	"minecraft:underwater_movement": EntityUnderwaterMovementComponent;
	"minecraft:variant": EntityVariantComponent;
}

export type { EntityComponents };
