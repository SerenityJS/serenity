import { AnimateHandler } from "./animate";
import { ContainerCloseHandler } from "./container-close";
import { DisconnectHandler } from "./disconnect";
import { ItemStackRequestHandler } from "./item-stack-request";
import { LoginHandler } from "./login";
import { MobEquipmentHandler } from "./mob-equipment";
import { PlayerAuthInputHandler } from "./player-auth-input";
import { RequestChunkRadiusHandler } from "./request-chunk-radius";
import { RequestNetworkSettingsHandler } from "./request-network-settings";
import { ResourcePackClientResponseHandler } from "./resource-pack-response";
import { SetLocalPlayerAsInitializedHandler } from "./set-local-player-as-initialized";
import { TextHandler } from "./text";

const Handlers = [
  RequestNetworkSettingsHandler,
  LoginHandler,
  ResourcePackClientResponseHandler,
  PlayerAuthInputHandler,
  SetLocalPlayerAsInitializedHandler,
  DisconnectHandler,
  ContainerCloseHandler,
  MobEquipmentHandler,
  ItemStackRequestHandler,
  RequestChunkRadiusHandler,
  AnimateHandler,
  TextHandler
];

export { Handlers };