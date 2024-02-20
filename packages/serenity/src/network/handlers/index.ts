import { BlockPickRequestHandler } from './BlockPickRequest.js';
import { ContainerCloseHandler } from './ContainerClose.js';
import { DisconnectHandler } from './Disconnect.js';
import { InteractHandler } from './Interact.js';
import { InventoryTransactionHandler } from './InventoryTransaction.js';
import { ItemStackRequestHandler } from './ItemStackRequest.js';
import { LoginHandler } from './Login.js';
import { ModalFormResponseHandler } from './ModalFormResponse.js';
import { MovePlayerHandler } from './MovePlayer.js';
import { PacketViolationWarningHandler } from './PacketViolationWarning.js';
import { PlayerActionHandler } from './PlayerAction.js';
import { RequestChunkRadiusHandler } from './RequestChunkRadius.js';
import { RequestNetworkSettingsHandler } from './RequestNetworkSettings.js';
import { ResourcePackClientResponseHandler } from './ResoucePackClientResponse.js';
import { SetLocalPlayerAsInitializedHandler } from './SetLocalPlayerAsInitialized.js';
import { TextHandler } from './Text.js';

export * from './NetworkHandler.js';

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
	ItemStackRequestHandler,
];

export { NETWORK_HANDLERS };
