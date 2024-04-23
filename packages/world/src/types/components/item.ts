import type { Items } from "@serenityjs/item";
import type { ItemNametagComponent } from "../../components";

interface ItemComponents<T extends keyof Items> {
	"minecraft:nametag": ItemNametagComponent<T>;
}

export { ItemComponents };
