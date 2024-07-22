import type {
	DeathInfoPacket,
	RemoveObjectivePacket,
	SetDisplayObjectivePacket,
	SetScorePacket,
	AddItemActorPacket,
	AddEntityPacket,
	AddPlayerPacket,
	AnimatePacket,
	AvailableCommandsPacket,
	BiomeDefinitionListPacket,
	BlockPickRequestPacket,
	ChangeDimensionPacket,
	ChunkRadiusUpdatePacket,
	CommandOutputPacket,
	CommandRequestPacket,
	ContainerClosePacket,
	ContainerOpenPacket,
	CreativeContentPacket,
	DisconnectPacket,
	InteractPacket,
	InventoryContentPacket,
	InventorySlotPacket,
	InventoryTransactionPacket,
	ItemComponentPacket,
	ItemStackRequestPacket,
	ItemStackResponsePacket,
	LevelChunkPacket,
	LevelEventPacket,
	LevelSoundEventPacket,
	LoginPacket,
	MobEquipmentPacket,
	ModalFormRequestPacket,
	ModalFormResponsePacket,
	MoveActorAbsolutePacket,
	MovePlayerPacket,
	NetworkChunkPublisherUpdatePacket,
	NetworkSettingsPacket,
	Packet,
	PacketViolationWarningPacket,
	PlayStatusPacket,
	PlayerActionPacket,
	PlayerAuthInputPacket,
	PlayerHotbarPacket,
	PlayerListPacket,
	RemoveEntityPacket,
	RequestChunkRadiusPacket,
	RequestNetworkSettingsPacket,
	ResourcePackChunkDataPacket,
	ResourcePackChunkRequestPacket,
	ResourcePackClientResponsePacket,
	ResourcePackDataInfoPacket,
	ResourcePackStackPacket,
	ResourcePacksInfoPacket,
	RespawnPacket,
	ScriptMessagePacket,
	SetActorMotionPacket,
	SetCommandsEnabledPacket,
	SetActorDataPacket,
	SetLocalPlayerAsInitializedPacket,
	SetPlayerGameTypePacket,
	SetTitlePacket,
	SetHudPacket,
	StartGamePacket,
	TextPacket,
	ToastRequestPacket,
	UpdateAbilitiesPacket,
	UpdateAdventureSettingsPacket,
	UpdateAttributesPacket,
	UpdateBlockPacket,
	SetTimePacket,
	SetScoreboardIdentityPacket,
	TransferPacket,
	TakeItemActorPacket,
	NetworkStackLatencyPacket,
	BossEventPacket,
	NpcDialoguePacket,
	ActorEventPacket,
	AnimateEntityPacket,
	EmoteListPacket,
	EmotePacket,
	PlayerSkinPacket,
	BlockActorDataPacket,
	AwardAchievementPacket,
	ServerToClientHandshakePacket,
	ClientboundCloseFormPacket,
	MobEffectPacket,
	SetPlayerInventoryOptionsPacket,
	CompletedUsingItemPacket,
	NpcRequestPacket,
	OpenSignPacket,
	ServerboundLoadingScreenPacketPacket,
	CameraShakePacket,
	BookEditPacket
} from "@serenityjs/protocol";
import type { NetworkPacketEvent } from "./packet-event";

/**
 * All available network events.
 */
interface NetworkEvents {
	[Packet.Login]: [NetworkPacketEvent<LoginPacket>];
	[Packet.PlayStatus]: [NetworkPacketEvent<PlayStatusPacket>];
	[Packet.ServerToClientHandshake]: [
		NetworkPacketEvent<ServerToClientHandshakePacket>
	];
	[Packet.Disconnect]: [NetworkPacketEvent<DisconnectPacket>];
	[Packet.ResourcePacksInfo]: [NetworkPacketEvent<ResourcePacksInfoPacket>];
	[Packet.ResourcePackStack]: [NetworkPacketEvent<ResourcePackStackPacket>];
	[Packet.ResourcePackClientResponse]: [
		NetworkPacketEvent<ResourcePackClientResponsePacket>
	];
	[Packet.Text]: [NetworkPacketEvent<TextPacket>];
	[Packet.SetTime]: [NetworkPacketEvent<SetTimePacket>];
	[Packet.StartGame]: [NetworkPacketEvent<StartGamePacket>];
	[Packet.AddPlayer]: [NetworkPacketEvent<AddPlayerPacket>];
	[Packet.AddEntity]: [NetworkPacketEvent<AddEntityPacket>];
	[Packet.RemoveEntity]: [NetworkPacketEvent<RemoveEntityPacket>];
	[Packet.AddItemActor]: [NetworkPacketEvent<AddItemActorPacket>];
	[Packet.TakeItemActor]: [NetworkPacketEvent<TakeItemActorPacket>];
	[Packet.MoveActorAbsolute]: [NetworkPacketEvent<MoveActorAbsolutePacket>];
	[Packet.MovePlayer]: [NetworkPacketEvent<MovePlayerPacket>];
	[Packet.UpdateBlock]: [NetworkPacketEvent<UpdateBlockPacket>];
	[Packet.LevelEvent]: [NetworkPacketEvent<LevelEventPacket>];
	[Packet.ActorEvent]: [NetworkPacketEvent<ActorEventPacket>];
	[Packet.UpdateAttributes]: [NetworkPacketEvent<UpdateAttributesPacket>];
	[Packet.InventoryTransaction]: [
		NetworkPacketEvent<InventoryTransactionPacket>
	];
	[Packet.CompletedUsingItem]: [NetworkPacketEvent<CompletedUsingItemPacket>];
	[Packet.MobEquipment]: [NetworkPacketEvent<MobEquipmentPacket>];
	[Packet.MobEffect]: [NetworkPacketEvent<MobEffectPacket>];
	[Packet.Interact]: [NetworkPacketEvent<InteractPacket>];
	[Packet.BlockPickRequest]: [NetworkPacketEvent<BlockPickRequestPacket>];
	[Packet.BookEdit]: [NetworkPacketEvent<BookEditPacket>];
	[Packet.PlayerAction]: [NetworkPacketEvent<PlayerActionPacket>];
	[Packet.SetActorData]: [NetworkPacketEvent<SetActorDataPacket>];
	[Packet.SetActorMotion]: [NetworkPacketEvent<SetActorMotionPacket>];
	[Packet.Animate]: [NetworkPacketEvent<AnimatePacket>];
	[Packet.Respawn]: [NetworkPacketEvent<RespawnPacket>];
	[Packet.ContainerOpen]: [NetworkPacketEvent<ContainerOpenPacket>];
	[Packet.ContainerClose]: [NetworkPacketEvent<ContainerClosePacket>];
	[Packet.PlayerHotbar]: [NetworkPacketEvent<PlayerHotbarPacket>];
	[Packet.InventoryContent]: [NetworkPacketEvent<InventoryContentPacket>];
	[Packet.InventorySlot]: [NetworkPacketEvent<InventorySlotPacket>];
	[Packet.BlockActorData]: [NetworkPacketEvent<BlockActorDataPacket>];
	[Packet.LevelChunk]: [NetworkPacketEvent<LevelChunkPacket>];
	[Packet.SetCommandsEnabled]: [NetworkPacketEvent<SetCommandsEnabledPacket>];
	[Packet.ChangeDimension]: [NetworkPacketEvent<ChangeDimensionPacket>];
	[Packet.SetPlayerGameType]: [NetworkPacketEvent<SetPlayerGameTypePacket>];
	[Packet.PlayerList]: [NetworkPacketEvent<PlayerListPacket>];
	[Packet.RequestChunkRadius]: [NetworkPacketEvent<RequestChunkRadiusPacket>];
	[Packet.ChunkRadiusUpdate]: [NetworkPacketEvent<ChunkRadiusUpdatePacket>];
	[Packet.BossEvent]: [NetworkPacketEvent<BossEventPacket>];
	[Packet.AvailableCommands]: [NetworkPacketEvent<AvailableCommandsPacket>];
	[Packet.CommandRequest]: [NetworkPacketEvent<CommandRequestPacket>];
	[Packet.CommandOutput]: [NetworkPacketEvent<CommandOutputPacket>];
	[Packet.ResourcePackDataInfo]: [
		NetworkPacketEvent<ResourcePackDataInfoPacket>
	];
	[Packet.ResourcePackChunkData]: [
		NetworkPacketEvent<ResourcePackChunkDataPacket>
	];
	[Packet.ResourcePackChunkRequest]: [
		NetworkPacketEvent<ResourcePackChunkRequestPacket>
	];
	[Packet.Transfer]: [NetworkPacketEvent<TransferPacket>];
	[Packet.SetTitle]: [NetworkPacketEvent<SetTitlePacket>];
	[Packet.PlayerSkin]: [NetworkPacketEvent<PlayerSkinPacket>];
	[Packet.NpcRequest]: [NetworkPacketEvent<NpcRequestPacket>];
	[Packet.OpenSign]: [NetworkPacketEvent<OpenSignPacket>];
	[Packet.CameraShake]: [NetworkPacketEvent<CameraShakePacket>];
	[Packet.ModalFormRequest]: [NetworkPacketEvent<ModalFormRequestPacket>];
	[Packet.ModalFormResponse]: [NetworkPacketEvent<ModalFormResponsePacket>];
	[Packet.RemoveObjective]: [NetworkPacketEvent<RemoveObjectivePacket>];
	[Packet.SetDisplayObjective]: [NetworkPacketEvent<SetDisplayObjectivePacket>];
	[Packet.SetScore]: [NetworkPacketEvent<SetScorePacket>];
	[Packet.SetScoreboardIdentity]: [
		NetworkPacketEvent<SetScoreboardIdentityPacket>
	];
	[Packet.NetworkStackLatency]: [NetworkPacketEvent<NetworkStackLatencyPacket>];
	[Packet.SetLocalPlayerAsInitialized]: [
		NetworkPacketEvent<SetLocalPlayerAsInitializedPacket>
	];
	[Packet.NetworkChunkPublisherUpdate]: [
		NetworkPacketEvent<NetworkChunkPublisherUpdatePacket>
	];
	[Packet.BiomeDefinitionList]: [NetworkPacketEvent<BiomeDefinitionListPacket>];
	[Packet.LevelSoundEvent]: [NetworkPacketEvent<LevelSoundEventPacket>];
	[Packet.Emote]: [NetworkPacketEvent<EmotePacket>];
	[Packet.NetworkSettings]: [NetworkPacketEvent<NetworkSettingsPacket>];
	[Packet.PlayerAuthInput]: [NetworkPacketEvent<PlayerAuthInputPacket>];
	[Packet.CreativeContent]: [NetworkPacketEvent<CreativeContentPacket>];
	[Packet.ItemStackRequest]: [NetworkPacketEvent<ItemStackRequestPacket>];
	[Packet.ItemStackResponse]: [NetworkPacketEvent<ItemStackResponsePacket>];
	[Packet.EmoteList]: [NetworkPacketEvent<EmoteListPacket>];
	[Packet.PacketViolationWarning]: [
		NetworkPacketEvent<PacketViolationWarningPacket>
	];
	[Packet.AnimateEntity]: [NetworkPacketEvent<AnimateEntityPacket>];
	[Packet.ItemComponent]: [NetworkPacketEvent<ItemComponentPacket>];
	[Packet.NpcDialogue]: [NetworkPacketEvent<NpcDialoguePacket>];
	[Packet.ScriptMessage]: [NetworkPacketEvent<ScriptMessagePacket>];
	[Packet.ToastRequest]: [NetworkPacketEvent<ToastRequestPacket>];
	[Packet.UpdateAbilities]: [NetworkPacketEvent<UpdateAbilitiesPacket>];
	[Packet.UpdateAdventureSettings]: [
		NetworkPacketEvent<UpdateAdventureSettingsPacket>
	];
	[Packet.DeathInfo]: [NetworkPacketEvent<DeathInfoPacket>];
	[Packet.RequestNetworkSettings]: [
		NetworkPacketEvent<RequestNetworkSettingsPacket>
	];
	[Packet.SetPlayerInventoryOptions]: [
		NetworkPacketEvent<SetPlayerInventoryOptionsPacket>
	];
	[Packet.SetHud]: [NetworkPacketEvent<SetHudPacket>];
	[Packet.AwardAchievement]: [NetworkPacketEvent<AwardAchievementPacket>];
	[Packet.ClientboundCloseForm]: [
		NetworkPacketEvent<ClientboundCloseFormPacket>
	];
	[Packet.ServerboundLoadingScreenPacket]: [
		NetworkPacketEvent<ServerboundLoadingScreenPacketPacket>
	];
}

export { NetworkEvents };
