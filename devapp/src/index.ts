import {
  Serenity,
  LevelDBProvider,
  CustomItemType,
  WorldEvent
} from "@serenityjs/core";
import { Pipeline } from "@serenityjs/plugins";
import { CreativeItemCategory, WearableSlot } from "@serenityjs/protocol";

const armor0Helmet = new CustomItemType("bridge:armor0_helmet", {
  creativeCategory: CreativeItemCategory.Equipment,
  creativeGroup: "Armor Set 0"
});
armor0Helmet.components.maxStackSize = 1;
armor0Helmet.components.wearable.slot = WearableSlot.Head;
armor0Helmet.components.icon = "bridge_armor0_helmet";
armor0Helmet.components.displayName = "Custom Helmet 0";

const armor0Chestplate = new CustomItemType("bridge:armor0_chestplate", {
  creativeCategory: CreativeItemCategory.Equipment,
  creativeGroup: "Armor Set 0"
});
armor0Chestplate.components.maxStackSize = 1;
armor0Chestplate.components.wearable.slot = WearableSlot.Chest;
armor0Chestplate.components.icon = "bridge_armor0_chestplate";
armor0Chestplate.components.displayName = "Custom Chestplate 0";

const armor0Leggings = new CustomItemType("bridge:armor0_leggings", {
  creativeCategory: CreativeItemCategory.Equipment,
  creativeGroup: "Armor Set 0"
});
armor0Leggings.components.maxStackSize = 1;
armor0Leggings.components.wearable.slot = WearableSlot.Legs;
armor0Leggings.components.icon = "bridge_armor0_leggings";
armor0Leggings.components.displayName = "Custom Leggings 0";

const armor0Boots = new CustomItemType("bridge:armor0_boots", {
  creativeCategory: CreativeItemCategory.Equipment,
  creativeGroup: "Armor Set 0"
});
armor0Boots.components.maxStackSize = 1;
armor0Boots.components.wearable.slot = WearableSlot.Feet;
armor0Boots.components.icon = "bridge_armor0_boots";
armor0Boots.components.displayName = "Custom Boots 0";

const armor1Helmet = new CustomItemType("bridge:armor1_helmet", {
  creativeCategory: CreativeItemCategory.Equipment,
  creativeGroup: "Armor Set 1"
});
armor1Helmet.components.maxStackSize = 1;
armor1Helmet.components.wearable.slot = WearableSlot.Head;
armor1Helmet.components.icon = "bridge_armor1_helmet";
armor1Helmet.components.displayName = "Custom Helmet 1";

const armor1Chestplate = new CustomItemType("bridge:armor1_chestplate", {
  creativeCategory: CreativeItemCategory.Equipment,
  creativeGroup: "Armor Set 1"
});
armor1Chestplate.components.maxStackSize = 1;
armor1Chestplate.components.wearable.slot = WearableSlot.Chest;
armor1Chestplate.components.icon = "bridge_armor1_chestplate";
armor1Chestplate.components.displayName = "Custom Chestplate 1";

const armor1Leggings = new CustomItemType("bridge:armor1_leggings", {
  creativeCategory: CreativeItemCategory.Equipment,
  creativeGroup: "Armor Set 1"
});
armor1Leggings.components.maxStackSize = 1;
armor1Leggings.components.wearable.slot = WearableSlot.Legs;
armor1Leggings.components.icon = "bridge_armor1_leggings";
armor1Leggings.components.displayName = "Custom Leggings 1";

const armor1Boots = new CustomItemType("bridge:armor1_boots", {
  creativeCategory: CreativeItemCategory.Equipment,
  creativeGroup: "Armor Set 1"
});
armor1Boots.components.maxStackSize = 1;
armor1Boots.components.wearable.slot = WearableSlot.Feet;
armor1Boots.components.icon = "bridge_armor1_boots";
armor1Boots.components.displayName = "Custom Boots 1";

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

serenity.on(WorldEvent.WorldInitialize, ({ world }) => {
  world.itemPalette.registerType(armor0Helmet);
  world.itemPalette.registerType(armor0Chestplate);
  world.itemPalette.registerType(armor0Leggings);
  world.itemPalette.registerType(armor0Boots);

  world.itemPalette.registerType(armor1Helmet);
  world.itemPalette.registerType(armor1Chestplate);
  world.itemPalette.registerType(armor1Leggings);
  world.itemPalette.registerType(armor1Boots);
});

// Register the LevelDBProvider
serenity.registerProvider(LevelDBProvider, { path: "./worlds" });

// Start the server
serenity.start();
