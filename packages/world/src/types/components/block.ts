import type {
	BlockInventoryComponent,
	BlockNBTComponent
} from "../../components";

interface BlockComponents {
	"minecraft:inventory": BlockInventoryComponent;
	"minecraft:nbt": BlockNBTComponent;
}

export { BlockComponents };
