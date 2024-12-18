import {
  Serenity,
  LevelDBProvider,
  BlockTrait,
  BlockIdentifier,
  WorldEvent
} from "@serenityjs/core";
import { Pipeline } from "@serenityjs/plugins";

// Create a new Serenity instance
const serenity = new Serenity({
  path: "./properties.json",
  permissions: "./permissions.json",
  resourcePacks: "./resource_packs",
  debugLogging: true
});

class CustomBlockTrait extends BlockTrait {
  public static readonly identifier = "custom";
  public static readonly types = [BlockIdentifier.Cobblestone];

  public onTick(deltaTick: number): void {
    this.block.world.sendMessage(`tick: ${deltaTick}`);
  }
}

serenity.on(WorldEvent.WorldInitialize, ({ world }) => {
  world.blockPalette.registerTrait(CustomBlockTrait);
});

// Create a new plugin pipeline
new Pipeline(serenity, { path: "./plugins" });

// Register the LevelDBProvider
serenity.registerProvider(LevelDBProvider, { path: "./worlds" });

// Start the server
serenity.start();
