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
	BlockSupportedComponent,
	BlockTillableComponent,
	BlockGrowthComponent,
	BlockGravityComponent
} from "../../components";

interface BlockSateCompnents {
	"minecraft:growth": BlockGrowthComponent;
}

interface BlockComponents extends BlockSateCompnents {
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
	"minecraft:tillable": BlockTillableComponent;
	"minecraft:gravity": BlockGravityComponent;
}

export { BlockComponents };
