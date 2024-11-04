import {
  Serenity,
  LevelDBProvider,
  TerrainGenerator,
  Chunk,
  BlockIdentifier,
  WorldEvent,
  BlockInventoryTrait,
  ItemStack,
  ItemIdentifier
} from "@serenityjs/core";
import { Pipeline } from "@serenityjs/plugins";

// Create a new Serenity instance
const serenity = new Serenity({
  port: 19142,
  permissions: "./permissions.json",
  debugLogging: true
});

class TestGenerator extends TerrainGenerator {
  public static readonly identifier = "test";

  public apply(cx: number, cz: number): Chunk {
    const chunk = new Chunk(cx, cz, this.dimension.type);

    const chest = this.world.blockPalette.resolvePermutation(
      BlockIdentifier.Chest
    );

    chunk.setPermutation({ x: 0, y: 0, z: 0 }, chest);

    return chunk;
  }
}

serenity.registerGenerator(TestGenerator);

serenity.on(WorldEvent.ChunkReady, (event) => {
  if (event.dimension.generator.identifier !== "test") return;

  // Get the chest block for each chunk
  const { x: cx, z: cz } = event.chunk;

  const block = event.dimension.getBlock({ x: cx << 4, y: 0, z: cz << 4 });

  const { container } = block.getTrait(BlockInventoryTrait);

  const stack = new ItemStack(ItemIdentifier.Diamond, { amount: 64 });

  container.addItem(stack);
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
