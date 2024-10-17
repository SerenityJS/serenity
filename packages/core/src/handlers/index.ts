import { ContainerCloseHandler } from "./container-close";
import { DisconnectHandler } from "./disconnect";
import { LoginHandler } from "./login";
import { PlayerAuthInputHandler } from "./player-auth-input";
import { RequestNetworkSettingsHandler } from "./request-network-settings";
import { ResourcePackClientResponseHandler } from "./resource-pack-response";
import { SetLocalPlayerAsInitializedHandler } from "./set-local-player-as-initialized";

const Handlers = [
  RequestNetworkSettingsHandler,
  LoginHandler,
  ResourcePackClientResponseHandler,
  PlayerAuthInputHandler,
  SetLocalPlayerAsInitializedHandler,
  DisconnectHandler,
  ContainerCloseHandler
];

export { Handlers };
