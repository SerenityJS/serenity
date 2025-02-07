import {
  Serenity,
  LevelDBProvider,
  CustomItemType,
  WorldEvent,
  EntityIdentifier,
  ItemStack,
  EntityEquipmentTrait,
  ItemEnchantableTrait,
  ItemIdentifier
} from "@serenityjs/core";
import { Pipeline } from "@serenityjs/plugins";
import { Enchantment, EquipmentSlot, WearableSlot } from "@serenityjs/protocol";

// Create a new Serenity instance
const serenity = new Serenity({
  path: "./properties.json",
  serenity: {
    permissions: "./permissions.json",
    resourcePacks: "./resource_packs",
    debugLogging: true
  }
});

// Create a new plugin pipeline
new Pipeline(serenity, { path: "./plugins" });

// Register the LevelDBProvider
serenity.registerProvider(LevelDBProvider, { path: "./worlds" });

// Start the server
serenity.start();

const ht = new CustomItemType("bridge:armor0_helmet", { maxAmount: 1 });
ht.components.maxStackSize = 1;
ht.components.wearable.slot = WearableSlot.Head;
ht.components.wearable.protection = 100;
ht.components.icon = "bridge_armor0_helmet";

const ct = new CustomItemType("bridge:armor0_chestplate", { maxAmount: 1 });
ct.components.maxStackSize = 1;
ct.components.wearable.slot = WearableSlot.Chest;
ct.components.wearable.protection = 100;
ct.components.icon = "bridge_armor0_chestplate";

const lt = new CustomItemType("bridge:armor0_leggings", { maxAmount: 1 });
lt.components.maxStackSize = 1;
lt.components.wearable.slot = WearableSlot.Legs;
lt.components.wearable.protection = 100;
lt.components.icon = "bridge_armor0_leggings";

const bt = new CustomItemType("bridge:armor0_boots", { maxAmount: 1 });
bt.components.maxStackSize = 1;
bt.components.wearable.slot = WearableSlot.Feet;
bt.components.wearable.protection = 100;
bt.components.icon = "bridge_armor0_boots";

for (const [, world] of serenity.worlds) {
  world.itemPalette.registerType(ht);
  world.itemPalette.registerType(ct);
  world.itemPalette.registerType(lt);
  world.itemPalette.registerType(bt);
}

serenity.on(WorldEvent.EntitySpawned, ({ entity }) => {
  if (entity.identifier !== EntityIdentifier.Zombie) return;

  const equipment = entity.addTrait(EntityEquipmentTrait);

  const helmet = new ItemStack(ItemIdentifier.NetheriteHelmet);
  const he = helmet.addTrait(ItemEnchantableTrait);
  he.addEnchantment(Enchantment.Protection, 4);

  const chestplate = new ItemStack(ItemIdentifier.NetheriteChestplate);
  const hc = chestplate.addTrait(ItemEnchantableTrait);
  hc.addEnchantment(Enchantment.Protection, 4);

  const leggings = new ItemStack(ItemIdentifier.NetheriteLeggings);
  const hl = leggings.addTrait(ItemEnchantableTrait);
  hl.addEnchantment(Enchantment.Protection, 4);

  const boots = new ItemStack(ItemIdentifier.NetheriteBoots);
  const hb = boots.addTrait(ItemEnchantableTrait);
  hb.addEnchantment(Enchantment.Protection, 4);

  equipment.setEqupment(EquipmentSlot.Head, helmet);
  equipment.setEqupment(EquipmentSlot.Chest, chestplate);
  equipment.setEqupment(EquipmentSlot.Legs, leggings);
  equipment.setEqupment(EquipmentSlot.Feet, boots);
});
