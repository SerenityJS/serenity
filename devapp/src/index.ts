import {
  Serenity,
  LevelDBProvider,
  WorldEvent,
  Player,
  EntityIdentifier
} from "@serenityjs/core";
import { Pipeline } from "@serenityjs/plugins";

// Create a new Serenity instance
const serenity = new Serenity({
  port: 19142,
  permissions: "./permissions.json",
  resourcePacks: "./resource_packs",
  debugLogging: true
});

serenity.on(WorldEvent.WorldInitialize, ({ world }) => {
  world.commands.register("test", "", (context) => {
    if (!(context.origin instanceof Player)) return;

    const entity = context.origin.dimension.spawnEntity(
      EntityIdentifier.Npc,
      context.origin.position
    );

    entity.scale = Math.random() * (5.0 - 0.1) + 0.1;
    entity.variant = Math.floor(Math.random() * (15 - 1) + 1);
    entity.nameTag = `${entity.runtimeId}:${entity.uniqueId}`;
    entity.alwaysShowNameTag = true;
  });
});

// Create a new plugin pipeline
const pipeline = new Pipeline(serenity, { path: "./plugins" });

// Initialize the pipeline
void pipeline.initialize(() => {
  // Register the LevelDBProvider
  serenity.registerProvider(LevelDBProvider, { path: "./worlds" });

  // Start the server
  serenity.start();
});
