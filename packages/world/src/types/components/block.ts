import type {
	BlockDirectionalComponent,
	BlockInventoryComponent,
	BlockNametagComponent,
	BlockSignComponent
} from "../../components";

interface BlockComponents {
	"minecraft:inventory": BlockInventoryComponent;
	"minecraft:nametag": BlockNametagComponent;
	"minecraft:directional": BlockDirectionalComponent;
	"minecraft:sign": BlockSignComponent;
}

export { BlockComponents };
