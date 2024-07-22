import type {
	BlockInventoryComponent,
	BlockNametagComponent,
	BlockSignComponent,
	BlockCardinalDirectionComponent,
	BlockWeirdoDirectionComponent
} from "../../components";

interface BlockComponents {
	"minecraft:inventory": BlockInventoryComponent;
	"minecraft:nametag": BlockNametagComponent;
	"minecraft:sign": BlockSignComponent;
	"minecraft:cardinal_direction": BlockCardinalDirectionComponent;
	"minecraft:weirdo_direction": BlockWeirdoDirectionComponent;
}

export { BlockComponents };
