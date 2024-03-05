// NOTE: Please try to put the packets in the order according to their id. Thx!

import { Disconnect } from '@serenityjs/raknet-protocol';
import { Packet } from '../enums/index.js';
import { AddEntity } from './AddEntity.js';
import { AddPlayer } from './AddPlayer.js';
import { Animate } from './Animate.js';
import { AvailableCommands } from './AvailableCommands.js';
import { BiomeDefinitionList } from './BiomeDefinitionList.js';
import { BlockPickRequest } from './BlockPickRequest.js';
import { ChangeDimension } from './ChangeDimension.js';
import { ChunkRadiusUpdate } from './ChunkRadiusUpdate.js';
import { CommandRequest } from './CommandRequest.js';
import { ContainerClose } from './ContainerClose.js';
import { ContainerOpen } from './ContainerOpen.js';
import { CreativeContent } from './CreativeContent.js';
import { Interact } from './Interact.js';
import { InventoryContent } from './InventoryContent.js';
import { InventorySlot } from './InventorySlot.js';
import { InventoryTransaction } from './InventoryTransaction.js';
import { ItemStackRequest } from './ItemStackRequest.js';
import { ItemStackResponse } from './ItemStackResponse.js';
import { LevelChunk } from './LevelChunk.js';
import { LevelEvent } from './LevelEvent.js';
import { Login } from './Login.js';
import { MobEquipment } from './MobEquipment.js';
import { ModalFormRequest } from './ModalFormRequest.js';
import { ModalFormResponse } from './ModalFormResponse.js';
import { MovePlayer } from './MovePlayer.js';
import { NetworkChunkPublisherUpdate } from './NetworkChunkPublisherUpdate.js';
import { NetworkSettings } from './NetworkSettings.js';
import { PacketViolationWarning } from './PacketViolationWarning.js';
import { PlayStatus } from './PlayStatus.js';
import { PlayerAction } from './PlayerAction.js';
import { PlayerAuthInput } from './PlayerAuthInput.js';
import { PlayerHotbar } from './PlayerHotbar.js';
import { PlayerList } from './PlayerList.js';
import { RemoveEntity } from './RemoveEntity.js';
import { RequestChunkRadius } from './RequestChunkRadius.js';
import { RequestNetworkSettings } from './RequestNetworkSettings.js';
import { ResourcePackClientResponse } from './ResourcePackClientResponse.js';
import { ResourcePackStack } from './ResourcePackStack.js';
import { ResourcePacksInfo } from './ResourcePacksInfo.js';
import { Respawn } from './Respawn.js';
import { ScriptMessage } from './ScriptMessage.js';
// import { SelectedSlot } from './SelectedSlot.js';
import { SetEntityData } from './SetEntityData.js';
import { SetLocalPlayerAsInitialized } from './SetLocalPlayerAsInitialized.js';
import { SetPlayerGameType } from './SetPlayerGameType.js';
import { SetTitle } from './SetTitle.js';
import { StartGame } from './StartGame.js';
import { Text } from './Text.js';
import { ToastRequest } from './ToastRequest.js';
import { UpdateAbilities } from './UpdateAbilities.js';
import { UpdateAdventureSettings } from './UpdateAdventureSettings.js';
import { UpdateAttributes } from './UpdateAttributes.js';
import { UpdateBlock } from './UpdateBlock.js';
import { SetCommandsEnabled } from './SetCommandsEnabled.js';
import { CommandOutput } from './CommandOutput.js';

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
	[Packet.RequestNetworkSettings]: RequestNetworkSettings, // 193
};

export { Packets };
