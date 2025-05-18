import {
  Serenity,
  LevelDBProvider,
  CustomItemType,
  WorldEvent
} from "@serenityjs/core";
import { Pipeline } from "@serenityjs/plugins";

// Create a new Serenity instance
const serenity = new Serenity({
  path: "./properties.json",
  serenity: {
    permissions: "./permissions.json",
    resources: "./resource_packs",
    debugLogging: true
  }
});

const itemType = new CustomItemType("serenity:test_item");
itemType.components.setIcon({ default: "serenity:copper_pickaxe" });
itemType.components.setDisplayName("Test Item");

serenity.on(WorldEvent.WorldInitialize, ({ world }) =>
  world.itemPalette.registerType(itemType)
);

// Create a new plugin pipeline
new Pipeline(serenity, { path: "./plugins" });

// Register the LevelDBProvider
serenity.registerProvider(LevelDBProvider, { path: "./worlds" });

// Start the server
serenity.start();
