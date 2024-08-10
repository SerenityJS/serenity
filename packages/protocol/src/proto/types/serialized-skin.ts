import { DataType } from "@serenityjs/raknet";
import { type BinaryStream, Endianness } from "@serenityjs/binarystream";

import { SkinImage } from "./skin-image";
import { SkinAnimation } from "./skin-animation";
import { SkinPersonaPiece } from "./skin-persona-piece";
import { SkinPersonaTintPiece } from "./skin-persona-tint-piece";

import type { ClientData } from "../../types";

/**
 * Represents a skin.
 */
class SerializedSkin extends DataType {
	/**
	 * The identifier of the skin.
	 */
	public identifier: string;

	/**
	 * The playfab identifier of the skin.
	 */
	public playFabIdentifier: string;

	/**
	 * The resource patch of the skin.
	 */
	public resourcePatch: string;

	/**
	 * The skin image.
	 */
	public skinImage: SkinImage;

	/**
	 * The animations of the skin.
	 */
	public animations: Array<SkinAnimation>;

	/**
	 * The cape image.
	 */
	public capeImage: SkinImage;

	/**
	 * The geometry data of the skin.
	 */
	public geometryData: string;

	/**
	 * The geometry version of the skin.
	 */
	public geometryVersion: string;

	/**
	 * The animation data of the skin.
	 */
	public animationData: string;

	/**
	 * The animation engine of the skin.
	 */
	public capeIdentifier: string;

	/**
	 * The full identifier of the skin.
	 */
	public fullIdentifier: string;

	/**
	 * The arm size of the skin.
	 */
	public armSize: string;

	/**
	 * The skin color of the skin.
	 */
	public skinColor: string;

	/**
	 * The persona pieces of the skin.
	 */
	public personaPieces: Array<SkinPersonaPiece>;

	/**
	 * The tint pieces of the skin.
	 */
	public tintPieces: Array<SkinPersonaTintPiece>;

	/**
	 * If the skin is premium.
	 */
	public isPremium: boolean;

	/**
	 * If the skin is persona.
	 */
	public isPersona: boolean;

	/**
	 * If there is a persona cape on classic skin.
	 */
	public isPersonaCapeOnClassic: boolean;

	/**
	 * If the skin is used by its primary user.
	 */
	public isPrimaryUser: boolean;

	/**
	 * If the skin will override the player appearance.
	 */
	public overridingPlayerAppearance: boolean;

	/**
	 * Creates a new serialized skin.
	 *
	 * @param identifier The identifier of the skin.
	 * @param playFabIdentifier The playfab identifier of the skin.
	 * @param resourcePatch The resource patch of the skin.
	 * @param skinImage The skin image.
	 * @param animations The animations of the skin.
	 * @param capeImage The cape image.
	 * @param geometryData The geometry data of the skin.
	 * @param geometryVersion The geometry version of the skin.
	 * @param animationData The animation data of the skin.
	 * @param capeIdentifier The cape identifier of the skin.
	 * @param fullIdentifier The full identifier of the skin.
	 * @param armSize The arm size of the skin.
	 * @param skin
	 * @param personaPieces The persona pieces of the skin.
	 * @param tintPieces The tint pieces of the skin.
	 * @param isPremium If the skin is premium.
	 * @param isPersona If the skin is persona.
	 * @param isPersonaCapeOnClassic If there is a persona cape on classic skin.
	 * @param isPrimaryUser If the skin is used by its primary user.
	 * @param overridingPlayerAppearance If the skin will override the player appearance.
	 * @returns A new serialized skin.
	 */
	public constructor(
		identifier: string,
		playFabIdentifier: string,
		resourcePatch: string,
		skinImage: SkinImage,
		animations: Array<SkinAnimation>,
		capeImage: SkinImage,
		geometryData: string,
		geometryVersion: string,
		animationData: string,
		capeIdentifier: string,
		fullIdentifier: string,
		armSize: string,
		skinColor: string,
		personaPieces: Array<SkinPersonaPiece>,
		tintPieces: Array<SkinPersonaTintPiece>,
		isPremium: boolean,
		isPersona: boolean,
		isPersonaCapeOnClassic: boolean,
		isPrimaryUser: boolean,
		overridingPlayerAppearance: boolean
	) {
		super();
		this.identifier = identifier;
		this.playFabIdentifier = playFabIdentifier;
		this.resourcePatch = resourcePatch;
		this.skinImage = skinImage;
		this.animations = animations;
		this.capeImage = capeImage;
		this.geometryData = geometryData;
		this.geometryVersion = geometryVersion;
		this.animationData = animationData;
		this.capeIdentifier = capeIdentifier;
		this.fullIdentifier = fullIdentifier;
		this.armSize = armSize;
		this.skinColor = skinColor;
		this.personaPieces = personaPieces;
		this.tintPieces = tintPieces;
		this.isPremium = isPremium;
		this.isPersona = isPersona;
		this.isPersonaCapeOnClassic = isPersonaCapeOnClassic;
		this.isPrimaryUser = isPrimaryUser;
		this.overridingPlayerAppearance = overridingPlayerAppearance;
	}

	public static read(stream: BinaryStream): SerializedSkin {
		// Read the properties of the serialized skin.
		const identifier = stream.readVarString();
		const playFabIdentifier = stream.readVarString();
		const resourcePatch = stream.readVarString();
		const skinImage = SkinImage.read(stream);

		// Read the amount of animations of the skin.
		const animationsLength = stream.readUint32(Endianness.Little);

		// Create a new array to store the animations of the skin.
		const animations = [];

		// Read the animations of the skin.
		for (let index = 0; index < animationsLength; index++) {
			animations.push(SkinAnimation.read(stream));
		}

		const capeImage = SkinImage.read(stream);
		const geometryData = stream.readVarString();
		const geometryVersion = stream.readVarString();
		const animationData = stream.readVarString();
		const capeIdentifier = stream.readVarString();
		const fullIdentifier = stream.readVarString();
		const armSize = stream.readVarString();
		const skinColor = stream.readVarString();

		// Read the amount of persona pieces of the skin.
		const personaPiecesLength = stream.readUint32(Endianness.Little);

		// Create a new array to store the persona pieces of the skin.
		const personaPieces = [];

		// Read the persona pieces of the skin.
		for (let index = 0; index < personaPiecesLength; index++) {
			personaPieces.push(SkinPersonaPiece.read(stream));
		}

		// Read the amount of tint pieces of the skin.
		const tintPiecesLength = stream.readUint32(Endianness.Little);

		// Create a new array to store the tint pieces of the skin.
		const tintPieces = [];

		// Read the tint pieces of the skin.
		for (let index = 0; index < tintPiecesLength; index++) {
			tintPieces.push(SkinPersonaTintPiece.read(stream));
		}

		const isPremium = stream.readBool();
		const isPersona = stream.readBool();
		const isPersonaCapeOnClassic = stream.readBool();
		const isPrimaryUser = stream.readBool();
		const overridingPlayerAppearance = stream.readBool();

		// Return the new serialized skin.
		return new SerializedSkin(
			identifier,
			playFabIdentifier,
			resourcePatch,
			skinImage,
			animations,
			capeImage,
			geometryData,
			geometryVersion,
			animationData,
			capeIdentifier,
			fullIdentifier,
			armSize,
			skinColor,
			personaPieces,
			tintPieces,
			isPremium,
			isPersona,
			isPersonaCapeOnClassic,
			isPrimaryUser,
			overridingPlayerAppearance
		);
	}

	public static write(stream: BinaryStream, skin: SerializedSkin): void {
		// Write the properties of the serialized skin.
		stream.writeVarString(skin.identifier);
		stream.writeVarString(skin.playFabIdentifier);
		stream.writeVarString(skin.resourcePatch);
		SkinImage.write(stream, skin.skinImage);

		// Write the animations of the skin.
		stream.writeUint32(skin.animations.length, Endianness.Little);
		for (const animation of skin.animations) {
			SkinAnimation.write(stream, animation);
		}

		SkinImage.write(stream, skin.capeImage);
		stream.writeVarString(skin.geometryData);
		stream.writeVarString(skin.geometryVersion);
		stream.writeVarString(skin.animationData);
		stream.writeVarString(skin.capeIdentifier);
		stream.writeVarString(skin.fullIdentifier);
		stream.writeVarString(skin.armSize);
		stream.writeVarString(skin.skinColor);

		// Write the persona pieces of the skin.
		stream.writeUint32(skin.personaPieces.length, Endianness.Little);
		for (const personaPiece of skin.personaPieces) {
			SkinPersonaPiece.write(stream, personaPiece);
		}

		// Write the tint pieces of the skin.
		stream.writeUint32(skin.tintPieces.length, Endianness.Little);
		for (const tintPiece of skin.tintPieces) {
			SkinPersonaTintPiece.write(stream, tintPiece);
		}

		stream.writeBool(skin.isPremium);
		stream.writeBool(skin.isPersona);
		stream.writeBool(skin.isPersonaCapeOnClassic);
		stream.writeBool(skin.isPrimaryUser);
		stream.writeBool(skin.overridingPlayerAppearance);
	}

	/**
	 * Converts the client data to a serialized skin.
	 * @param data The client data to convert.
	 * @returns The serialized skin.
	 */
	public static from(data: ClientData): SerializedSkin {
		return {
			identifier: data.SkinId,
			playFabIdentifier: data.PlayFabId,
			resourcePatch: Buffer.from(data.SkinResourcePatch, "base64").toString(
				"utf8"
			),
			skinImage: new SkinImage(
				data.SkinImageWidth,
				data.SkinImageHeight,
				Buffer.from(data.SkinData, "base64")
			),
			animations: data.AnimatedImageData.map(
				(animation) =>
					new SkinAnimation(
						new SkinImage(
							animation.ImageWidth,
							animation.ImageHeight,
							Buffer.from(animation.Image, "base64")
						),
						animation.Frames,
						animation.AnimationExpression,
						animation.Type
					)
			),
			capeImage: new SkinImage(
				data.CapeImageWidth,
				data.CapeImageHeight,
				Buffer.from(data.CapeData, "base64")
			),
			geometryData: Buffer.from(data.SkinGeometryData, "base64").toString(
				"utf8"
			),
			geometryVersion: Buffer.from(
				data.SkinGeometryDataEngineVersion,
				"base64"
			).toString("utf8"),
			animationData: data.SkinAnimationData,
			capeIdentifier: data.CapeId,
			fullIdentifier: data.SkinId + data.CapeId,
			armSize: data.ArmSize,
			skinColor: data.SkinColor,
			personaPieces: data.PersonaPieces.map(
				(piece) =>
					new SkinPersonaPiece(
						piece.PieceId,
						piece.PieceType,
						piece.PackId,
						piece.IsDefault,
						piece.ProductId
					)
			),
			tintPieces: data.PieceTintColors.map(
				(tint) => new SkinPersonaTintPiece(tint.PieceType, tint.Colors)
			),
			isPremium: data.PremiumSkin,
			isPersona: data.PersonaSkin,
			isPersonaCapeOnClassic: data.CapeOnClassicSkin,
			isPrimaryUser: data.TrustedSkin,
			overridingPlayerAppearance: data.OverrideSkin
		};
	}
}

export { SerializedSkin };
