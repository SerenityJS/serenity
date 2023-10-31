interface ClientData {
	AnimatedImageData: any[]; // TODO
	ArmSize: string;
	CapeData: string;
	CapeId: string;
	CapeImageHeight: number;
	CapeImageWidth: number;
	CapeOnClassicSkin: boolean;
	ClientRandomId: number;
	CompatibleWithClientSideChunkGen: true;
	CurrentInputMode: number;
	DefaultInputMode: number;
	DeviceId: string;
	DeviceModel: string;
	DeviceOS: number;
	GameVersion: string;
	GuiScale: number;
	IsEditorMode: boolean;
	LanguageCode: string;
	OverrideSkin: boolean;
	PersonaPieces: any[]; // TODO
	PersonaSkin: boolean;
	PieceTintColors: any[]; // TODO
	PlatformOfflineId: string;
	PlatformOnlineId: string;
	PlayFabId: string;
	PremiumSkin: boolean;
	SelfSignedId: string;
	ServerAddress: string;
	SkinAnimationData: string;
	SkinColor: string;
	SkinData: string;
	SkinGeometryData: string;
	SkinGeometryDataEngineVersion: string;
	SkinId: string;
	SkinImageHeight: number;
	SkinImageWidth: number;
	SkinResourcePatch: string;
	ThirdPartyName: string;
	ThirdPartyNameOnly: boolean;
	TrustedSkin: boolean;
	UIProfile: number;
}

interface IdentityData {
	XUID: string;
	displayName: string;
	identity: string;
	sandBoxId: string;
	titleId: string;
}

interface LoginTokenData {
	clientData: ClientData;
	identityData: IdentityData;
	publicKey: string;
}

export type { LoginTokenData, IdentityData, ClientData };
