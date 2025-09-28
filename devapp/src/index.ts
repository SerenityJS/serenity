import { Serenity, LevelDBProvider, WorldEvent } from "@serenityjs/core";
import { Pipeline } from "@serenityjs/plugins";

// Create a new Serenity instance
const serenity = new Serenity({
  path: "./properties.json",
  serenity: {
    permissions: "./permissions.json",
    debugLogging: true
  }
});

serenity.on(WorldEvent.WorldInitialize, ({ world }) => {
  const bread = world.itemPalette.getType("minecraft:bread");

  if (bread) {
    bread.components.setFood({
      can_always_eat: true,
      nutrition: 20
    });
  }
});

// Create a new plugin pipeline
new Pipeline(serenity, { path: "./plugins" });

// Register the LevelDBProvider
serenity.registerProvider(LevelDBProvider, { path: "./worlds" });

// Start the server
serenity.start();

serenity.on(WorldEvent.PlayerJoin, ({ player }) => {
  const storage = player.getStorage();

  if (!storage.hasDynamicProperty("rank")) {
    storage.setDynamicProperty("rank", "Member");

    console.log("Set rank to Member");
  }
});

serenity.before(WorldEvent.PlayerChat, ({ player, message, world }) => {
  const rank = player.getStorage().getDynamicProperty<string>("rank");

  if (rank) {
    world.sendMessage(`[${rank}] ${player.username}: ${message}`);
  } else {
    world.sendMessage(`${player.username}: ${message}`);
  }

  return false;
});
