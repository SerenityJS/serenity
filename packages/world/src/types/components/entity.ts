import type {
	PlayerAbsorptionComponent,
	EntityAlwaysShowNametagComponent,
	EntityArmorComponent,
	EntityBoundingHeightComponent,
	EntityBoundingWidthComponent,
	EntityBreathingComponent,
	EntityEffectsComponent,
	EntityHasGravityComponent,
	EntityHealthComponent,
	EntityInventoryComponent,
	EntityIsVisibleComponent,
	EntityItemComponent,
	EntityNametagComponent,
	EntityNpcComponent,
	EntityOnFireComponent,
	EntityPhysicsComponent,
	EntityScaleComponent,
	EntityVariantComponent
} from "../../components";

/**
 * The attribute components of an entity.
 */
interface EntityAttributeComponents {
	"minecraft:health": EntityHealthComponent;
	"minecraft:absorption": PlayerAbsorptionComponent;
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
	"minecraft:is_visible": EntityIsVisibleComponent;
	"minecraft:on_fire": EntityOnFireComponent;
	"minecraft:variant": EntityVariantComponent;
}

/**
 * The collective components of an entity.
 */
interface EntityComponents
	extends EntityAttributeComponents,
		EntityMetadataComponents {
	"minecraft:inventory": EntityInventoryComponent;
	"minecraft:armor": EntityArmorComponent;
	"minecraft:effects": EntityEffectsComponent;
	"minecraft:npc": EntityNpcComponent;
}

export {
	EntityAttributeComponents,
	EntityMetadataComponents,
	EntityComponents
};
