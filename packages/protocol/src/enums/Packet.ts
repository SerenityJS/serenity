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
	StartGame = 0x0b, // 11
	AddPlayer = 0x0c, // 12
	// AddEntity = 0x0d, // 13
	RemoveEntity = 0x0e, // 14
	MovePlayer = 0x13, // 19
	// TickSync = 0x17, // 23
	UpdateAttributes = 0x1d, // 29
	InventoryTransaction = 0x1e, // 30
	// SelectedSlot = 0x1f,
	Interact = 0x21, // 33
	BlockPickRequest = 0x22, // 34
	PlayerAction = 0x24, // 36
	SetEntityData = 0x27, // 39
	// SetSpawnPosition = 0x2b, // 43
	Respawn = 0x2d, // 45
	ContainerOpen = 0x2e, // 46
	ContainerClose = 0x2f, // 47
	// InventoryContent = 0x31, // 49
	LevelChunk = 0x3a, // 58
	// SetDifficulty = 0x3c, // 60
	ChangeDimension = 0x3d, // 61
	SetPlayerGameType = 0x3e, // 62
	PlayerList = 0x3f, // 63
	RequestChunkRadius = 0x45, // 69
	ChunkRadiusUpdate = 0x46, // 70
	AvailableCommands = 0x4c,
	CommandRequest = 0x4d, // 77
	SetTitle = 0x58, // 88
	ModalFormRequest = 0x64, // 100
	// ModalFormResponse = 0x65, // 101
	SetLocalPlayerAsInitialized = 0x71, // 113
	NetworkChunkPublisherUpdate = 0x79, // 121
	BiomeDefinitionList = 0x7a, // 122
	// ClientCacheStatus = 0x81, // 129
	NetworkSettings = 0x8f, // 143
	// PlayerAuthInput = 0x90, // 144
	CreativeContent = 0x91, // 145
	PacketViolationWarning = 0x9c, // 147
	// ItemComponent = 0xa2, // 162
	ScriptMessage = 0xb1, // 177
	ToastRequest = 0xba, // 186
	UpdateAbilities = 0xbb, // 187
	// UpdateAdventureSettings = 0xbc, // 188
	RequestNetworkSettings = 0xc1, // 193
}

export { Packet };
