import { Disconnect } from '@serenityjs/raknet-protocol';
import { Packet } from '../enums';
import { BiomeDefinitionList } from './BiomeDefinitionList';
import { CreativeContent } from './CreativeContent';
import { LevelChunk } from './LevelChunk';
import { Login } from './Login';
import { NetworkSettings } from './NetworkSettings';
import { PlayStatus } from './PlayStatus';
import { RequestNetworkSettings } from './RequestNetworkSettings';
import { ResourcePackClientResponse } from './ResourcePackClientResponse';
import { ResourcePackStack } from './ResourcePackStack';
import { ResourcePacksInfo } from './ResourcePacksInfo';
import { StartGame } from './StartGame';

const Packets = {
	[Packet.Login]: Login, // 1
	[Packet.PlayStatus]: PlayStatus, // 2
	// Gap
	[Packet.Disconnect]: Disconnect, // 5
	[Packet.ResourcePacksInfo]: ResourcePacksInfo, // 6
	[Packet.ResourcePackStack]: ResourcePackStack, // 7
	[Packet.ResourcePackClientResponse]: ResourcePackClientResponse, // 8
	// Gap
	[Packet.StartGame]: StartGame, // 11
	// Gap
	[Packet.LevelChunk]: LevelChunk, // 58
	// Gap
	[Packet.BiomeDefinitionList]: BiomeDefinitionList, // 122
	// Gap
	[Packet.NetworkSettings]: NetworkSettings, // 143
	// Gap
	[Packet.CreativeContent]: CreativeContent, // 145
	// Gap
	[Packet.RequestNetworkSettings]: RequestNetworkSettings, // 193
};

export { Packets };
