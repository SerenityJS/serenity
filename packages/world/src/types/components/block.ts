import type {
	BlockInventoryComponent,
	BlockNametagComponent,
	BlockNBTComponent
} from "../../components";

interface BlockComponents {
	"minecraft:inventory": BlockInventoryComponent;
	"minecraft:nametag": BlockNametagComponent;
	"minecraft:nbt": BlockNBTComponent;
}

export { BlockComponents };
