import type {
	AddEntity,
	AddPlayer,
	AvailableCommands,
	BiomeDefinitionList,
	BlockPickRequest,
	ChangeDimension,
	ChunkRadiusUpdate,
	CommandRequest,
	ContainerClose,
	ContainerOpen,
	CreativeContent,
	DataPacket,
	Disconnect,
	Interact,
	InventoryTransaction,
	LevelChunk,
	Login,
	ModalFormRequest,
	ModalFormResponse,
	MovePlayer,
	NetworkChunkPublisherUpdate,
	NetworkSettings,
	Packet,
	PacketViolationWarning,
	PlayStatus,
	PlayerAction,
	PlayerList,
	RemoveEntity,
	RequestChunkRadius,
	RequestNetworkSettings,
	ResourcePackClientResponse,
	ResourcePackStack,
	ResourcePacksInfo,
	Respawn,
	ScriptMessage,
	SetEntityData,
	SetLocalPlayerAsInitialized,
	SetPlayerGameType,
	SetTitle,
	StartGame,
	Text,
	ToastRequest,
	UpdateAbilities,
	UpdateAttributes,
	UpdateBlock,
} from '@serenityjs/bedrock-protocol';
import type { Player } from '../player/index.js';
import type { NetworkSession } from './Session.js';
import type { NetworkStatus } from './Status.js';

interface NetworkPacketEvent<T extends DataPacket> {
	packet: T;
	player: Player | null;
	session: NetworkSession;
	status: NetworkStatus;
}

interface NetworkEvents {
	[Packet.Login]: [NetworkPacketEvent<Login>];
	[Packet.PlayStatus]: [NetworkPacketEvent<PlayStatus>];
	[Packet.Disconnect]: [NetworkPacketEvent<Disconnect>];
	[Packet.ResourcePacksInfo]: [NetworkPacketEvent<ResourcePacksInfo>];
	[Packet.ResourcePackStack]: [NetworkPacketEvent<ResourcePackStack>];
	[Packet.ResourcePackClientResponse]: [NetworkPacketEvent<ResourcePackClientResponse>];
	[Packet.Text]: [NetworkPacketEvent<Text>];
	[Packet.StartGame]: [NetworkPacketEvent<StartGame>];
	[Packet.AddPlayer]: [NetworkPacketEvent<AddPlayer>];
	[Packet.AddEntity]: [NetworkPacketEvent<AddEntity>];
	[Packet.RemoveEntity]: [NetworkPacketEvent<RemoveEntity>];
	[Packet.MovePlayer]: [NetworkPacketEvent<MovePlayer>];
	[Packet.UpdateBlock]: [NetworkPacketEvent<UpdateBlock>];
	[Packet.UpdateAttributes]: [NetworkPacketEvent<UpdateAttributes>];
	[Packet.InventoryTransaction]: [NetworkPacketEvent<InventoryTransaction>];
	[Packet.Interact]: [NetworkPacketEvent<Interact>];
	[Packet.BlockPickRequest]: [NetworkPacketEvent<BlockPickRequest>];
	[Packet.PlayerAction]: [NetworkPacketEvent<PlayerAction>];
	[Packet.SetEntityData]: [NetworkPacketEvent<SetEntityData>];
	[Packet.Respawn]: [NetworkPacketEvent<Respawn>];
	[Packet.ContainerOpen]: [NetworkPacketEvent<ContainerOpen>];
	[Packet.ContainerClose]: [NetworkPacketEvent<ContainerClose>];
	[Packet.LevelChunk]: [NetworkPacketEvent<LevelChunk>];
	[Packet.ChangeDimension]: [NetworkPacketEvent<ChangeDimension>];
	[Packet.SetPlayerGameType]: [NetworkPacketEvent<SetPlayerGameType>];
	[Packet.PlayerList]: [NetworkPacketEvent<PlayerList>];
	[Packet.RequestChunkRadius]: [NetworkPacketEvent<RequestChunkRadius>];
	[Packet.ChunkRadiusUpdate]: [NetworkPacketEvent<ChunkRadiusUpdate>];
	[Packet.AvailableCommands]: [NetworkPacketEvent<AvailableCommands>];
	[Packet.CommandRequest]: [NetworkPacketEvent<CommandRequest>];
	[Packet.SetTitle]: [NetworkPacketEvent<SetTitle>];
	[Packet.ModalFormRequest]: [NetworkPacketEvent<ModalFormRequest>];
	[Packet.ModalFormResponse]: [NetworkPacketEvent<ModalFormResponse>];
	[Packet.SetLocalPlayerAsInitialized]: [NetworkPacketEvent<SetLocalPlayerAsInitialized>];
	[Packet.NetworkChunkPublisherUpdate]: [NetworkPacketEvent<NetworkChunkPublisherUpdate>];
	[Packet.BiomeDefinitionList]: [NetworkPacketEvent<BiomeDefinitionList>];
	[Packet.NetworkSettings]: [NetworkPacketEvent<NetworkSettings>];
	[Packet.CreativeContent]: [NetworkPacketEvent<CreativeContent>];
	[Packet.PacketViolationWarning]: [NetworkPacketEvent<PacketViolationWarning>];
	[Packet.ScriptMessage]: [NetworkPacketEvent<ScriptMessage>];
	[Packet.ToastRequest]: [NetworkPacketEvent<ToastRequest>];
	[Packet.UpdateAbilities]: [NetworkPacketEvent<UpdateAbilities>];
	[Packet.RequestNetworkSettings]: [NetworkPacketEvent<RequestNetworkSettings>];
}

export type { NetworkPacketEvent, NetworkEvents };
