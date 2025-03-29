import { WorldEvent } from "../enums";
import { World } from "../world";

class EventSignal {
  /**
   * The identifier of the signal.
   */
  public static readonly identifier: WorldEvent;

  /**
   * The identifier of the signal.
   */
  public readonly identifier = (this.constructor as typeof EventSignal)
    .identifier;

  /**
   * The world instance the signal was emitted in.
   */
  public readonly world: World;

  /**
   * Creates a new signal instance.
   * @param world The world instance the signal was emitted in.
   * @returns A new signal instance.
   */
  public constructor(world: World) {
    this.world = world;
  }

  /**
   * Emits the signal instance.
   * @returns Whether the signal was emitted successfully; default is true.
   */
  public async emit(): Promise<boolean> {
    // Emit the signal in the world and server
    const [world, server] = await Promise.all([
      this.world.emit(this.identifier, this),
      this.world.serenity.emit(this.identifier, this)
    ]);

    // Return whether the signal was emitted successfully
    return world && server;
  }
}

export { EventSignal };
