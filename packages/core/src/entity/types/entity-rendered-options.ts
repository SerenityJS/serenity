import { EntityActorMetadata } from "../actor-metadata";
import { Player } from "../player";

interface EntityRenderedOptions {
  /**
   * Whether the rendering should be cancelled.
   */
  cancel: boolean;

  /**
   * The player for whom the entity is being rendered.
   */
  player: Player;

  /**
   * The actor metadata of the entity being rendered.
   * This can be modified to change how the entity is rendered per player.
   */
  metadata: EntityActorMetadata;
}

export { EntityRenderedOptions };
