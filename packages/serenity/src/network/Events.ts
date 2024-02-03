import type {
	AddPlayer,
	AvailableCommands,
	BiomeDefinitionList,
	BlockPickRequest,
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
} from '@serenityjs/bedrock-protocol';
import type { Player } from '../player';
import type { NetworkSession } from './Session';
import type { NetworkStatus } from './Status';

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
	[Packet.RemoveEntity]: [NetworkPacketEvent<RemoveEntity>];
	[Packet.MovePlayer]: [NetworkPacketEvent<MovePlayer>];
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
	[Packet.SetPlayerGameType]: [NetworkPacketEvent<SetPlayerGameType>];
	[Packet.PlayerList]: [NetworkPacketEvent<PlayerList>];
	[Packet.RequestChunkRadius]: [NetworkPacketEvent<RequestChunkRadius>];
	[Packet.ChunkRadiusUpdate]: [NetworkPacketEvent<ChunkRadiusUpdate>];
	[Packet.AvailableCommands]: [NetworkPacketEvent<AvailableCommands>];
	[Packet.CommandRequest]: [NetworkPacketEvent<CommandRequest>];
	[Packet.SetTitle]: [NetworkPacketEvent<SetTitle>];
	[Packet.ModalFormRequest]: [NetworkPacketEvent<ModalFormRequest>];
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
