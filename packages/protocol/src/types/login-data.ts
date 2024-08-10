interface ClientData {
	AnimatedImageData: Array<AnimatedImageData>;
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
	PersonaPieces: Array<PersonaPiece>;
	PersonaSkin: boolean;
	PieceTintColors: Array<PieceTintColor>;
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

interface AnimatedImageData {
	AnimationExpression: number;
	Frames: 2;
	Image: string;
	ImageHeight: number;
	ImageWidth: number;
	Type: number;
}

interface PersonaPiece {
	IsDefault: boolean;
	PackId: string;
	PieceId: string;
	PieceType: string;
	ProductId: string;
}

interface PieceTintColor {
	Colors: Array<string>;
	PieceType: string;
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
