import { Packets } from '@serenityjs/protocol';
import type { Handler } from './Handler';
import { LoginHandler } from './Login';
import { MovePlayerHandler } from './MovePlayer';
import { RequestNetworkSettingsHandler } from './RequestNetworkSettings';
import { ResourcePackClientResponseHandler } from './ResourcePackClientResponse';
import { SetLocalPlayerAsInitializedHandler } from './SetLocalPlayerAsInitialized';
import { StartGameHandler } from './StartGame';
import { TickSyncHandler } from './TickSync';

export * from './Handler';

const Handlers: Map<Packets, typeof Handler> = new Map();

Handlers.set(Packets.RequestNetworkSettings, RequestNetworkSettingsHandler);
Handlers.set(Packets.Login, LoginHandler);
Handlers.set(Packets.ResourcePackClientResponse, ResourcePackClientResponseHandler);
Handlers.set(Packets.StartGame, StartGameHandler);
Handlers.set(Packets.MovePlayer, MovePlayerHandler);
Handlers.set(Packets.TickSync, TickSyncHandler);
Handlers.set(Packets.SetLocalPlayerAsInitialized, SetLocalPlayerAsInitializedHandler);

export { Handlers };
