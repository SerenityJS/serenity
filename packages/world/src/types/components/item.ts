import type { Items } from "@serenityjs/item";
import type {
	ItemArmorComponent,
	ItemDurabilityComponent,
	ItemEnchantableComponent,
	ItemLoreComponent,
	ItemNametagComponent
} from "../../components";

interface ItemComponents<T extends keyof Items> {
	"minecraft:nametag": ItemNametagComponent<T>;
	"minecraft:enchantable": ItemEnchantableComponent<T>;
	"minecraft:lore": ItemLoreComponent<T>;
	"minecraft:durability": ItemDurabilityComponent<T>;
	"minecraft:armor": ItemArmorComponent<T>;
}

export { ItemComponents };
