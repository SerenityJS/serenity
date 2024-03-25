import {
	EntityAlwaysShowNametagComponent,
	EntityBreathingComponent,
	EntityHasGravityComponent,
	EntityHealthComponent,
	EntityInvetoryComponent,
	EntityNametagComponent
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
