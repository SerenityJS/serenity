import { ClientCacheStatusHandler } from './ClientCacheStatus';
import { InteractHandler } from './Interact';
import { MovePlayerHandler } from './MovePlayer';
import { PlayerActionHandler } from './PlayerAction';
import { RequestChunkRadiusHandler } from './RequestChunkRadius';
import { ResourcePackClientResponseHandler } from './ResourcePackClientResponse';
import { SetLocalPlayerAsInitializedHandler } from './SetLocalPlayerAsInitialized';
import { StartGameHandler } from './StartGame';
import { TextHandler } from './Text';
import { TickSyncHandler } from './TickSync';

export * from './PlayerHandler';

export const playerHandlers = [
	RequestChunkRadiusHandler,
	ResourcePackClientResponseHandler,
	StartGameHandler,
	InteractHandler,
	ClientCacheStatusHandler,
	MovePlayerHandler,
	PlayerActionHandler,
	SetLocalPlayerAsInitializedHandler,
	TextHandler,
	TickSyncHandler,
];
