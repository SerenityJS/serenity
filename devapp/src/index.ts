import {
  Serenity,
  LevelDBProvider,
  WorldEvent,
  ItemType,
  ItemStack
} from "@serenityjs/core";
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

serenity.on(WorldEvent.WorldInitialize, ({ world }) => {
  world.commandPalette.register("test", "", () => {
    const dimension = world.getDimension("overworld");

    const amount = ItemType.types.size;
    const itemTypes = Array.from(ItemType.types.values());

    for (let x = -20; x <= 20; x++) {
      for (let z = -20; z <= 20; z++) {
        const index = Math.floor(Math.random() * amount);

        const type = itemTypes[index]!;

        dimension?.spawnItem(new ItemStack(type), { x, y: 100, z });
      }
    }
  });
});

// Create a new plugin pipeline
new Pipeline(serenity, { path: "./plugins" });

// Register the LevelDBProvider
serenity.registerProvider(LevelDBProvider, { path: "./worlds" });

// Start the server
serenity.start();
