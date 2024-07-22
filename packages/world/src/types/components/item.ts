import type { Items } from "@serenityjs/item";
import type {
	ItemArmorComponent,
	ItemBookComponent,
	ItemDurabilityComponent,
	ItemDyeComponent,
	ItemEnchantableComponent,
	ItemFoodComponent,
	ItemLoreComponent,
	ItemNametagComponent
} from "../../components";

interface ItemComponents<T extends keyof Items> {
	"minecraft:nametag": ItemNametagComponent<T>;
	"minecraft:enchantable": ItemEnchantableComponent<T>;
	"minecraft:lore": ItemLoreComponent<T>;
	"minecraft:durability": ItemDurabilityComponent<T>;
	"minecraft:armor": ItemArmorComponent<T>;
	"minecraft:food": ItemFoodComponent<T>;
	"minecraft:dye": ItemDyeComponent<T>;
	"minecraft:writtable_book": ItemBookComponent<T>;
}

export { ItemComponents };
