import {
  Serenity,
  LevelDBProvider,
  PositionEnum,
  Player,
  EntityIdentifier,
  EntityMovementTrait
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

// Create a new plugin pipeline
new Pipeline(serenity, { path: "./plugins" });

// Register the LevelDBProvider
serenity.registerProvider(LevelDBProvider, { path: "./worlds" });

// Start the server
serenity.start();

for (const world of serenity.getWorlds()) {
  world.commands.register(
    "movement",
    "",
    (registry) => {
      registry.overload(
        {
          to: PositionEnum
        },
        (context) => {
          const position = context.to.result;

          if (!(context.origin instanceof Player) || !position) return;

          const entity = context.origin.dimension.spawnEntity(
            EntityIdentifier.Zombie,
            context.origin.position
          );

          const movement = entity.getTrait(EntityMovementTrait);

          movement.moveTowards(position);
        }
      );
    },
    () => {}
  );
}
