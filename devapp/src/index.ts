import {
  Serenity,
  LevelDBProvider,
  CustomBlockType,
  CustomItemType,
  WorldEvent,
  BlockPermutation
} from "@serenityjs/core";
import { Pipeline } from "@serenityjs/plugins";

const block = new CustomBlockType("serenityjs:custom_block", {
  friction: 0.4,
  hardness: 0.5,
  solid: true
});

BlockPermutation.create(block, {});

const item = new CustomItemType("serenityjs:custom_block", {
  block
});

// Create a new Serenity instance
const serenity = new Serenity({
  path: "./properties.json",
  permissions: "./permissions.json",
  resourcePacks: "./resource_packs",
  debugLogging: true
});

serenity.on(WorldEvent.WorldInitialize, ({ world }) => {
  world.blockPalette.registerType(block);
  world.itemPalette.registerType(item);
});

// Create a new plugin pipeline
new Pipeline(serenity, { path: "./plugins" });

// Register the LevelDBProvider
serenity.registerProvider(LevelDBProvider, { path: "./worlds" });

// Start the server
serenity.start();
