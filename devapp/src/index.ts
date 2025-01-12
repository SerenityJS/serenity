import { Serenity, LevelDBProvider, JsonObjectEnum } from "@serenityjs/core";
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
new Pipeline(serenity, { path: "./plugins" });

// Register the LevelDBProvider
serenity.registerProvider(LevelDBProvider, { path: "./worlds" });

// Start the server
serenity.start();

for (const [, world] of serenity.worlds) {
  world.commands.register(
    "strtest",
    "",
    (registry) => {
      registry.overload(
        {
          json: JsonObjectEnum
        },
        ({ json }) => {
          console.log(json.result);
        }
      );
    },
    () => {}
  );
}
