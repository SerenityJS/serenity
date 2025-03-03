import { Difficulty, Gamemode, GameRule } from "@serenityjs/protocol";

import { DimensionProperties } from "./dimension";

interface WorldProperties {
  /**
   * The identifier of the world.
   */
  identifier: string;

  /**
   * The generation seed of the world.
   */
  seed: number;

  /**
   * The gamemode of the world.
   */
  gamemode: Gamemode | "survival" | "creative" | "adventure" | "spectator";

  /**
   * The difficulty of the world.
   */
  difficulty: Difficulty | "peaceful" | "easy" | "normal" | "hard";

  /**
   * The amount of minutes between each save.
   */
  saveInterval: number;

  /**
   * The dimension properties of the world.
   */
  dimensions: Array<Partial<DimensionProperties>>;

  /**
   * The gamerules of the world.
   */
  gamerules: Partial<Record<GameRule, boolean | number>>;
}

export { WorldProperties };
