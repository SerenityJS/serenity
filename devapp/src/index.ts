import {
  Serenity,
  LevelDBProvider,
  CustomItemType,
  WorldEvent
} from "@serenityjs/core";
import { Pipeline } from "@serenityjs/plugins";
import { CreativeItemCategory } from "@serenityjs/protocol";

const itemType = new CustomItemType("test:item");
itemType.creativeCategory = CreativeItemCategory.Equipment;

// Create a new Serenity instance
const serenity = new Serenity({
  path: "./properties.json",
  serenity: {
    permissions: "./permissions.json",
    resourcePacks: "./resource_packs",
    debugLogging: true
  }
});

serenity.on(WorldEvent.WorldInitialize, ({ world }) => {
  world.itemPalette.registerType(itemType);
});

// Create a new plugin pipeline
new Pipeline(serenity, { path: "./plugins" });

// Register the LevelDBProvider
serenity.registerProvider(LevelDBProvider, { path: "./worlds" });

// Start the server
serenity.start();
