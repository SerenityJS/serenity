import { Serenity, LevelDBProvider, CustomEntityType } from "@serenityjs/core";
import { Pipeline } from "@serenityjs/plugins";

const entityType = new CustomEntityType("pokeb:pokestop");
entityType.createBooleanProperty("pokeb:used", false);

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
