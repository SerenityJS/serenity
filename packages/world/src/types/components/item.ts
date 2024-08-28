import type { ItemFluidContainerComponent } from "../../components/item/fluid-container";
import type { Items } from "@serenityjs/item";
import type {
	ItemArmorComponent,
	ItemBookComponent,
	ItemDurabilityComponent,
	ItemDyeComponent,
	ItemEnchantableComponent,
	ItemFoodComponent,
	ItemLoreComponent,
	ItemNametagComponent,
	ItemPotionComponent,
	ItemShooterComponent,
	ItemSmeltableComponent,
	ItemThrowableComponent
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
	"minecraft:fluid_container": ItemFluidContainerComponent<T>;
	"minecraft:potion": ItemPotionComponent<T>;
	"minecraft:smeltable": ItemSmeltableComponent<T>;
	"minecraft:throwable": ItemThrowableComponent<T>;
	"minecraft:shooter": ItemShooterComponent<T>;
}

export { ItemComponents };
