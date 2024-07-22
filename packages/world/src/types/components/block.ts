import type {
	BlockInventoryComponent,
	BlockNametagComponent,
	BlockSignComponent,
	BlockCardinalDirectionComponent,
	BlockWeirdoDirectionComponent,
	BlockUpsideDownBitComponent
} from "../../components";

interface BlockComponents {
	"minecraft:inventory": BlockInventoryComponent;
	"minecraft:nametag": BlockNametagComponent;
	"minecraft:sign": BlockSignComponent;
	"minecraft:cardinal_direction": BlockCardinalDirectionComponent;
	"minecraft:weirdo_direction": BlockWeirdoDirectionComponent;
	"minecraft:upside_down_bit": BlockUpsideDownBitComponent;
}

export { BlockComponents };
