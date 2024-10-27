import { WorldEvent } from "../enums";

import { EventSignal } from "./event-signal";

class WorldInitializeSignal extends EventSignal {
  public static readonly identifier = WorldEvent.WorldInitialize;
}

export { WorldInitializeSignal };
