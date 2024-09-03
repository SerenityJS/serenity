import type {
	BlockInventoryComponent,
	BlockNametagComponent,
	BlockCardinalDirectionComponent,
	BlockWeirdoDirectionComponent,
	BlockFluidContainerComponent,
	BlockUpsideDownBitComponent,
	BlockCollisionComponent,
	BlockSignComponent,
	BlockLootComponent,
	BlockSupportedComponent
} from "../../components";

interface BlockComponents {
	"minecraft:inventory": BlockInventoryComponent;
	"minecraft:nametag": BlockNametagComponent;
	"minecraft:cardinal_direction": BlockCardinalDirectionComponent;
	"minecraft:weirdo_direction": BlockWeirdoDirectionComponent;
	"minecraft:cauldron_liquid": BlockFluidContainerComponent;
	"minecraft:upside_down_bit": BlockUpsideDownBitComponent;
	"minecraft:collision_box": BlockCollisionComponent;
	"minecraft:sign": BlockSignComponent;
	"minecraft:loot_table": BlockLootComponent;
	"minecraft:supported": BlockSupportedComponent;
}

export { BlockComponents };
