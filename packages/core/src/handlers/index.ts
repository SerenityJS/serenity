import { AnimateHandler } from "./animate";
import { ContainerCloseHandler } from "./container-close";
import { DisconnectHandler } from "./disconnect";
import { InventoryTransactionHandler } from "./inventory-transaction";
import { ItemStackRequestHandler } from "./item-stack-request";
import { LoginHandler } from "./login";
import { MobEquipmentHandler } from "./mob-equipment";
import { PlayerActionHandler } from "./player-action";
import { PlayerAuthInputHandler } from "./player-auth-input";
import { RequestChunkRadiusHandler } from "./request-chunk-radius";
import { RequestNetworkSettingsHandler } from "./request-network-settings";
import { ResourcePackClientResponseHandler } from "./resource-pack-response";
import { SetLocalPlayerAsInitializedHandler } from "./set-local-player-as-initialized";
import { TextHandler } from "./text";
import { CommandRequestHandler } from "./command-request";
import { InteractHandler } from "./interact";
import { RespawnHandler } from "./respawn";
import { ModalFormResponseHandler } from "./modal-form-response";
import { RequestPermissionsHandler } from "./request-permissions";
import { BlockPickRequestHandler } from "./block-pick-request";
import { EmoteHandler } from "./emote";
import { ResourcePackChunkRequestHandler } from "./resource-pack-chunk-request";
import { ActorEventHandler } from "./actor-event";
import { EntityPickRequestHandler } from "./entity-pick-request";

const Handlers = [
  RequestNetworkSettingsHandler,
  LoginHandler,
  ResourcePackClientResponseHandler,
  ResourcePackChunkRequestHandler,
  PlayerAuthInputHandler,
  SetLocalPlayerAsInitializedHandler,
  DisconnectHandler,
  ContainerCloseHandler,
  MobEquipmentHandler,
  ItemStackRequestHandler,
  RequestChunkRadiusHandler,
  AnimateHandler,
  InventoryTransactionHandler,
  PlayerActionHandler,
  TextHandler,
  CommandRequestHandler,
  InteractHandler,
  RespawnHandler,
  ModalFormResponseHandler,
  RequestPermissionsHandler,
  BlockPickRequestHandler,
  EntityPickRequestHandler,
  EmoteHandler,
  ActorEventHandler
];

export { Handlers };
