import type { Items } from "@serenityjs/item";
import type {
	ItemEnchantableComponent,
	ItemNametagComponent
} from "../../components";

interface ItemComponents<T extends keyof Items> {
	"minecraft:nametag": ItemNametagComponent<T>;
	"minecraft:enchantable": ItemEnchantableComponent<T>;
}

export { ItemComponents };
