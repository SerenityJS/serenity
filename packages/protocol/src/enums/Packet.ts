// NOTE: Please try to put the packets in the order according to their id. Thx!

enum Packet {
	Login = 0x01, // 1
	PlayStatus = 0x02, // 2
	// ServerToClientHandshake = 0x03, // 3
	// ClientToServerHandshake = 0x04, // 4
	Disconnect = 0x05, // 5
	ResourcePacksInfo = 0x06, // 6
	ResourcePackStack = 0x07, // 7
	ResourcePackClientResponse = 0x08, // 8
	Text = 0x09, // 9
	// // Gap
	StartGame = 0x0b, // 11
	// AddPlayer = 0x0c, // 12
	// AddEntity = 0x0d, // 13
	// RemoveEntity = 0x0e, // 14
	// // Gap
	MovePlayer = 0x13, // 19
	// // Gap
	// TickSync = 0x17, // 23
	// // Gap
	// UpdateAttributes = 0x1d, // 29
	// // Gap
	Interact = 0x21, // 33
	// // Gap
	PlayerAction = 0x24, // 36
	// // Gap
	// SetEntityData = 0x27, // 39
	// // Gap
	// SetSpawnPosition = 0x2b, // 43
	// Respawn = 0x2d, // 45
	ContainerOpen = 0x2e, // 46
	ContainerClose = 0x2f, // 47
	// // Gap
	// InventoryContent = 0x31, // 49
	// // Gap
	LevelChunk = 0x3a, // 58
	// SetDifficulty = 0x3c, // 60
	// Gap
	PlayerList = 0x3f, // 63
	// Gap
	// RequestChunkRadius = 0x45, // 69
	// ChunkRadiusUpdate = 0x46, // 70
	// Gap
	CommandRequest = 0x4d, // 77
	// Gap
	SetTitle = 0x58, // 88
	// // Gap
	// ModalFormRequest = 0x64, // 100
	// ModalFormResponse = 0x65, // 101
	// // Gap
	SetLocalPlayerAsInitialized = 0x71, // 113
	// // Gap
	// NetworkChunkPublisherUpdate = 0x79, // 121
	BiomeDefinitionList = 0x7a, // 122
	// // Gap
	// ClientCacheStatus = 0x81, // 129
	// // Gap
	NetworkSettings = 0x8f, // 143
	// PlayerAuthInput = 0x90, // 144
	CreativeContent = 0x91, // 145
	// Gap
	PacketViolationWarning = 0x9c, // 147
	// // Gap
	// ItemComponent = 0xa2, // 162
	// Gap
	ScriptMessage = 0xb1, // 177
	// // Gap
	ToastRequest = 0xba, // 186
	UpdateAbilities = 0xbb, // 187
	// UpdateAdventureSettings = 0xbc, // 188
	// Gap
	RequestNetworkSettings = 0xc1, // 193
}

export { Packet };
