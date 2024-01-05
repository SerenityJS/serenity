import { Disconnect } from '@serenityjs/raknet-protocol';
import { Packet } from '../enums';
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
	[Packet.NetworkSettings]: NetworkSettings, // 143
	// Gap
	[Packet.RequestNetworkSettings]: RequestNetworkSettings, // 193
};

export { Packets };
