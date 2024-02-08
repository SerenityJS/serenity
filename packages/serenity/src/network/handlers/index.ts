import { BlockPickRequestHandler } from './BlockPickRequest';
import { ContainerCloseHandler } from './ContainerClose';
import { DisconnectHandler } from './Disconnect';
import { InteractHandler } from './Interact';
import { InventoryTransactionHandler } from './InventoryTransaction';
import { LoginHandler } from './Login';
import { ModalFormResponseHandler } from './ModalFormResponse';
import { MovePlayerHandler } from './MovePlayer';
import { PacketViolationWarningHandler } from './PacketViolationWarning';
import { PlayerActionHandler } from './PlayerAction';
import { RequestChunkRadiusHandler } from './RequestChunkRadius';
import { RequestNetworkSettingsHandler } from './RequestNetworkSettings';
import { ResourcePackClientResponseHandler } from './ResoucePackClientResponse';
import { SetLocalPlayerAsInitializedHandler } from './SetLocalPlayerAsInitialized';
import { TextHandler } from './Text';

export * from './NetworkHandler';

const NETWORK_HANDLERS = [
	RequestNetworkSettingsHandler,
	LoginHandler,
	ResourcePackClientResponseHandler,
	MovePlayerHandler,
	PacketViolationWarningHandler,
	TextHandler,
	InteractHandler,
	ContainerCloseHandler,
	PlayerActionHandler,
	BlockPickRequestHandler,
	SetLocalPlayerAsInitializedHandler,
	InventoryTransactionHandler,
	DisconnectHandler,
	RequestChunkRadiusHandler,
	ModalFormResponseHandler,
];

export { NETWORK_HANDLERS };
