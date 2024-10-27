import { WorldEvent } from "../../enums";
import {
  EntityDespawnedSignal,
  EntitySpawnedSignal,
  PlayerBreakBlockSignal,
  PlayerChatSignal,
  PlayerJoinSignal,
  PlayerLeaveSignal,
  PlayerPlaceBlockSignal,
  WorldInitializeSignal,
  WorldTickSignal
} from "../../events";

interface WorldEventSignals {
  [WorldEvent.WorldInitialize]: [WorldInitializeSignal];
  [WorldEvent.WorldTick]: [WorldTickSignal];
  [WorldEvent.EntitySpawned]: [EntitySpawnedSignal];
  [WorldEvent.EntityDespawned]: [EntityDespawnedSignal];
  [WorldEvent.PlayerJoin]: [PlayerJoinSignal];
  [WorldEvent.PlayerLeave]: [PlayerLeaveSignal];
  [WorldEvent.PlayerChat]: [PlayerChatSignal];
  [WorldEvent.PlayerPlaceBlock]: [PlayerPlaceBlockSignal];
  [WorldEvent.PlayerBreakBlock]: [PlayerBreakBlockSignal];
  [WorldEvent.BlockUpdate]: [];
}

export { WorldEventSignals };
