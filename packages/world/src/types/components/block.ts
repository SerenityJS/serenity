import type {
	BlockDirectionalComponent,
	BlockInventoryComponent,
	BlockNametagComponent
} from "../../components";

interface BlockComponents {
	"minecraft:inventory": BlockInventoryComponent;
	"minecraft:nametag": BlockNametagComponent;
	"minecraft:directional": BlockDirectionalComponent;
}

export { BlockComponents };
