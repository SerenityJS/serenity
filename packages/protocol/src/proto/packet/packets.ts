// NOTE: Please try to put the packets in the order according to their id. Thx!

import { Packet } from "../../enums";

import { AddEntity } from "./add-entity";
import { AddPlayer } from "./add-player";
import { Animate } from "./animate";
import { AvailableCommands } from "./available-commands";
import { BiomeDefinitionList } from "./biome-definition-list";
import { BlockPickRequest } from "./block-pick-request";
import { ChangeDimension } from "./change-dimension";
import { ChunkRadiusUpdate } from "./chunk-radius-update";
import { CommandOutput } from "./command-output";
import { CommandRequest } from "./command-request";
import { ContainerClose } from "./container-close";
import { ContainerOpen } from "./container-open";
import { CreativeContent } from "./creative-content";
import { Disconnect } from "./disconnect";
import { Interact } from "./interact";
import { InventoryContent } from "./inventory-content";
import { InventorySlot } from "./inventory-slot";
import { InventoryTransaction } from "./inventory-transaction";
import { ItemStackRequest } from "./item-stack-request";
import { ItemStackResponse } from "./item-stack-response";
import { LevelChunk } from "./level-chunk";
import { LevelEvent } from "./level-event";
import { Login } from "./login";
import { MobEquipment } from "./mob-equipment";
import { ModalFormRequest } from "./modal-form-request";
import { ModalFormResponse } from "./modal-form-response";
import { MoveEntity } from "./move-entity";
import { MovePlayer } from "./move-player";
import { NetworkChunkPublisherUpdate } from "./network-chunk-publisher-update";
import { NetworkSettings } from "./network-settings";
import { PacketViolationWarning } from "./packet-violation-warning";
import { PlayStatus } from "./play-status";
import { PlayerAction } from "./player-action";
import { PlayerAuthInput } from "./player-auth-input";
import { PlayerHotbar } from "./player-hotbar";
import { PlayerList } from "./player-list";
import { RemoveEntity } from "./remove-entity";
import { RequestChunkRadius } from "./request-chunk-radius";
import { RequestNetworkSettings } from "./request-network-settings";
import { ResourcePackClientResponse } from "./resource-pack-client-response";
import { ResourcePackStack } from "./resource-pack-stack";
import { ResourcePacksInfo } from "./resource-packs-info";
import { Respawn } from "./respawn";
import { ScriptMessage } from "./script-message";
import { SetCommandsEnabled } from "./set-commands-enabled";
import { SetEntityData } from "./set-entity-data";
import { SetLocalPlayerAsInitialized } from "./set-local-player-as-initialized";
import { SetPlayerGameType } from "./set-player-game-type";
import { SetTitle } from "./set-title";
import { StartGame } from "./start-game";
import { Text } from "./text";
import { ToastRequest } from "./toast-request";
import { UpdateAbilities } from "./update-abilities";
import { UpdateAdventureSettings } from "./update-adventure-settings";
import { UpdateAttributes } from "./update-attributes";
import { UpdateBlock } from "./update-block";

const Packets = {
	[Packet.Login]: Login, // 1
	[Packet.PlayStatus]: PlayStatus, // 2
	[Packet.Disconnect]: Disconnect, // 5
	[Packet.ResourcePacksInfo]: ResourcePacksInfo, // 6
	[Packet.ResourcePackStack]: ResourcePackStack, // 7
	[Packet.ResourcePackClientResponse]: ResourcePackClientResponse, // 8
	[Packet.Text]: Text, // 9
	[Packet.StartGame]: StartGame, // 11
	[Packet.AddPlayer]: AddPlayer, // 12
	[Packet.AddEntity]: AddEntity, // 13
	[Packet.RemoveEntity]: RemoveEntity, // 14
	[Packet.MoveEntity]: MoveEntity, // 18
	[Packet.MovePlayer]: MovePlayer, // 19
	[Packet.UpdateBlock]: UpdateBlock, // 21
	[Packet.LevelEvent]: LevelEvent, // 25
	[Packet.UpdateAttributes]: UpdateAttributes, // 29
	[Packet.InventoryTransaction]: InventoryTransaction, // 30
	[Packet.MobEquipment]: MobEquipment, // 31
	[Packet.Interact]: Interact, // 33
	[Packet.BlockPickRequest]: BlockPickRequest, // 34
	[Packet.PlayerAction]: PlayerAction, // 36
	[Packet.SetEntityData]: SetEntityData, // 39
	[Packet.Animate]: Animate, // 44
	[Packet.Respawn]: Respawn, // 45
	[Packet.ContainerOpen]: ContainerOpen, // 46
	[Packet.ContainerClose]: ContainerClose, // 47
	[Packet.PlayerHotbar]: PlayerHotbar, // 48
	[Packet.InventoryContent]: InventoryContent, // 49
	[Packet.InventorySlot]: InventorySlot, // 50
	[Packet.LevelChunk]: LevelChunk, // 58
	[Packet.SetCommandsEnabled]: SetCommandsEnabled, // 59
	[Packet.ChangeDimension]: ChangeDimension, // 61
	[Packet.SetPlayerGameType]: SetPlayerGameType, // 62
	[Packet.PlayerList]: PlayerList, // 63
	[Packet.RequestChunkRadius]: RequestChunkRadius, // 69
	[Packet.ChunkRadiusUpdate]: ChunkRadiusUpdate, // 70
	[Packet.AvailableCommands]: AvailableCommands, // 76
	[Packet.CommandRequest]: CommandRequest, // 77
	[Packet.CommandOutput]: CommandOutput, // 79
	[Packet.SetTitle]: SetTitle, // 88
	[Packet.ModalFormRequest]: ModalFormRequest, // 100
	[Packet.ModalFormResponse]: ModalFormResponse, // 101
	[Packet.SetLocalPlayerAsInitialized]: SetLocalPlayerAsInitialized, // 113
	[Packet.NetworkChunkPublisherUpdate]: NetworkChunkPublisherUpdate, // 121
	[Packet.BiomeDefinitionList]: BiomeDefinitionList, // 122
	[Packet.NetworkSettings]: NetworkSettings, // 143
	[Packet.PlayerAuthInput]: PlayerAuthInput, // 144
	[Packet.CreativeContent]: CreativeContent, // 145
	[Packet.ItemStackRequest]: ItemStackRequest, // 147
	[Packet.ItemStackResponse]: ItemStackResponse, // 148
	[Packet.PacketViolationWarning]: PacketViolationWarning, // 156
	[Packet.ScriptMessage]: ScriptMessage, // 177
	[Packet.ToastRequest]: ToastRequest, // 186
	[Packet.UpdateAbilities]: UpdateAbilities, // 187
	[Packet.UpdateAdventureSettings]: UpdateAdventureSettings, // 188
	[Packet.RequestNetworkSettings]: RequestNetworkSettings // 193
};

export { Packets };
