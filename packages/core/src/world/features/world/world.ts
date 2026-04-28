import { Player } from "../../../entity";
import { World } from "../../world";
import { Feature } from "../feature";

class WorldFeature extends Feature {
  /**
   * The world that this feature is attached to.
   */
  protected readonly world: World;

  /**
   * Creates a new world feature.
   * @param world The world that this feature is attached to.
   */
  public constructor(world: World) {
    super();
    this.world = world;
  }

  public onPlayerJoin?(player: Player): void;

  public onPlayerLeave?(player: Player): void;
}

export { WorldFeature };
