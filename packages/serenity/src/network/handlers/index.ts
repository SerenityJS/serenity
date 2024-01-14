import { LoginHandler } from './Login';
import { MovePlayerHandler } from './MovePlayer';
import { PacketViolationWarningHandler } from './PacketViolationWarning';
import { RequestNetworkSettingsHandler } from './RequestNetworkSettings';
import { ResourcePackClientResponseHandler } from './ResoucePackClientResponse';
import { TextHandler } from './Text';

export * from './NetworkHandler';

const NETWORK_HANDLERS = [
	RequestNetworkSettingsHandler,
	LoginHandler,
	ResourcePackClientResponseHandler,
	MovePlayerHandler,
	PacketViolationWarningHandler,
	TextHandler,
];

export { NETWORK_HANDLERS };
