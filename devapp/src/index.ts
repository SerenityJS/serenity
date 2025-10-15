import {
  Serenity,
  LevelDBProvider,
  EntityType,
  EntityIdentifier,
  WorldEvent
} from "@serenityjs/core";
import { Pipeline } from "@serenityjs/plugins";

const player = EntityType.get(EntityIdentifier.Player)!;
player.createIntProperty("test", [0, 3], 0);

const coew = EntityType.get(EntityIdentifier.Cow)!;
coew.createEnumProperty("minecraft:climate_variant", [
  "temperate",
  "warm",
  "cold"
]);

// Create a new Serenity instance
const serenity = new Serenity({
  path: "./properties.json",
  serenity: {
    permissions: "./permissions.json",
    debugLogging: true
  }
});

// Create a new plugin pipeline
new Pipeline(serenity, { path: "./plugins" });

// Register the LevelDBProvider
serenity.registerProvider(LevelDBProvider, { path: "./worlds" });

// Start the server
serenity.start();

serenity.on(WorldEvent.PlayerUseItem, ({ player }) => {
  const property = player.sharedProperties.getSharedProperty<number>("test");

  // Increment the property value
  const next = (property ?? 0) + 1;
  player.sharedProperties.setSharedProperty("test", next > 3 ? 0 : next);

  const value = player.sharedProperties.getSharedProperty<number>("test");
  player.sendMessage(`Property value is now: ${value}`);
});

serenity.on(WorldEvent.PlayerInteractWithEntity, ({ target }) => {
  if (target.identifier !== EntityIdentifier.Cow) return;

  const property = target.sharedProperties.getSharedProperty<string>(
    "minecraft:climate_variant"
  );

  // Cycle through the enum values
  let next: string;
  switch (property) {
    case "temperate":
      next = "warm";
      break;
    case "warm":
      next = "cold";
      break;
    case "cold":
      next = "temperate";
      break;
    default:
      next = "temperate";
  }

  target.sharedProperties.setSharedProperty("minecraft:climate_variant", next);
});
