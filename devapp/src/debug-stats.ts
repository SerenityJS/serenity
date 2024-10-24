import {
  EntityIdentifier,
  PlayerChunkRenderingTrait,
  PlayerTrait
} from "@serenityjs/core";
import { BossEventColor } from "@serenityjs/protocol";

import { Bossbar } from "./bossbar";

class DebugStatsTrait extends PlayerTrait {
  public static readonly identifier = "debug_stats";

  public static readonly types = [EntityIdentifier.Player];

  protected visible = false;

  public readonly bossbar = new Bossbar(
    this.player,
    "Debug Stats",
    1,
    BossEventColor.Red
  );

  public onSpawn(): void {
    this.player.op();

    this.bossbar.show(this.player);
  }

  public onTick(): void {
    const serenity = this.player.dimension.world.serenity;

    // Update the bossbar information
    // const direction = CardinalDirection[this.player.getCardinalDirection()];
    const tps = serenity?.tps ?? 0;
    const memory = process.memoryUsage().heapUsed / 1024 / 1024;
    const entities = this.player.dimension.entities.size;
    const chunks = this.player.getTrait(PlayerChunkRenderingTrait).chunks.size;

    // Set the title of the bossbar
    this.bossbar.setTitle(
      `TPS: ${tps} | Memory: ${memory.toFixed(2)}MB | Entities: ${entities} | Chunks: ${chunks}`
    );
  }
}

export { DebugStatsTrait };
