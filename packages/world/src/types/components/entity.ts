import {
	EntityAlwaysShowNametagComponent,
	EntityBoundingHeightComponent,
	EntityBoundingWidthComponent,
	EntityBreathingComponent,
	EntityHasGravityComponent,
	EntityHealthComponent,
	EntityInvetoryComponent,
	EntityNametagComponent,
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
}

/**
 * The collective components of an entity.
 */
interface EntityComponents
	extends EntityAttributeComponents,
		EntityMetadataComponents {
	"minecraft:inventory": EntityInvetoryComponent;
}

export {
	EntityAttributeComponents,
	EntityMetadataComponents,
	EntityComponents
};
