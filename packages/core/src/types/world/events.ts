import { WorldEvent } from "../../enums";
import {
  EntityDespawnedSignal,
  EntitySpawnedSignal,
  PlayerBreakBlockSignal,
  PlayerChatSignal,
  PlayerDropItemSignal,
  PlayerJoinSignal,
  PlayerLeaveSignal,
  PlayerPlaceBlockSignal,
  PlayerStartUsingItemSignal,
  PlayerStopUsingItemSignal,
  PlayerUseItemSignal,
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
  [WorldEvent.PlayerDropItem]: [PlayerDropItemSignal];
  [WorldEvent.PlayerStartUsingItem]: [PlayerStartUsingItemSignal];
  [WorldEvent.PlayerStopUsingItem]: [PlayerStopUsingItemSignal];
  [WorldEvent.PlayerUseItem]: [PlayerUseItemSignal];
  [WorldEvent.BlockUpdate]: [];
}

export { WorldEventSignals };
