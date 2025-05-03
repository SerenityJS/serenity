import { Serenity, LevelDBProvider } from "@serenityjs/core";
import { Pipeline } from "@serenityjs/plugins";

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
const pipeline = new Pipeline(serenity, { path: "./plugins" });

// Initialize the pipeline
pipeline.initialize().then(() => {
  // Register the LevelDBProvider
  serenity.registerProvider(LevelDBProvider, { path: "./worlds" });

  // Start the server
  return serenity.start();
});
