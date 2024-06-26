import type {
	EntityAlwaysShowNametagComponent,
	EntityArmorComponent,
	EntityBoundingHeightComponent,
	EntityBoundingWidthComponent,
	EntityBreathingComponent,
	EntityHasGravityComponent,
	EntityHealthComponent,
	EntityInventoryComponent,
	EntityItemComponent,
	EntityNametagComponent,
	EntityPhysicsComponent,
	EntityScaleComponent
} from "../../components";

/**
 * The attribute components of an entity.
 */
interface EntityAttributeComponents {
	"minecraft:health": EntityHealthComponent;
}

/**
 * The metadata components of an entity.
 */
interface EntityMetadataComponents {
	"minecraft:has_gravity": EntityHasGravityComponent;
	"minecraft:breathing": EntityBreathingComponent;
	"minecraft:nametag": EntityNametagComponent;
	"minecraft:always_show_nametag": EntityAlwaysShowNametagComponent;
	"minecraft:boundingbox_width": EntityBoundingWidthComponent;
	"minecraft:boundingbox_height": EntityBoundingHeightComponent;
	"minecraft:scale": EntityScaleComponent;
	"minecraft:item": EntityItemComponent;
	"minecraft:physics": EntityPhysicsComponent;
}

/**
 * The collective components of an entity.
 */
interface EntityComponents
	extends EntityAttributeComponents,
		EntityMetadataComponents {
	"minecraft:inventory": EntityInventoryComponent;
	"minecraft:armor": EntityArmorComponent;
}

export {
	EntityAttributeComponents,
	EntityMetadataComponents,
	EntityComponents
};
