import { LoginHandler } from "./login";
import { PlayerAuthInputHandler } from "./player-auth-input";
import { RequestNetworkSettingsHandler } from "./request-network-settings";
import { ResourcePackClientResponseHandler } from "./resource-pack-response";

const Handlers = [
  RequestNetworkSettingsHandler,
  LoginHandler,
  ResourcePackClientResponseHandler,
  PlayerAuthInputHandler
];

export { Handlers };
