import { Buffer } from 'node:buffer';
import { BinaryStream, Endianness } from '@serenityjs/binaryutils';
import type { ClientData } from '../../types/index.js';

//
// TODO: Document this file, and split it up into multiple files.
//

interface SkinImage {
	data: Buffer;
	height: number;
	width: number;
}

interface SkinAnimation {
	expression: number;
	frames: number;
	image: SkinImage;
	type: number;
}

interface SkinCape {
	id: string;
	image: SkinImage;
}

interface SkinPersona {
	pieces: SkinPersonaPiece[];
	tintColors: SkinPersonaTintColor[];
}

interface SkinPersonaPiece {
	def: boolean;
	packId: string;
	pieceId: string;
	pieceType: string;
	productId: string;
}

interface SkinPersonaTintColor {
	colors: string[];
	type: string;
}

class Skin {
	public readonly id: string;
	public readonly playFabId: string;
	public readonly resourcePatch: string;
	public readonly color: string;
	public readonly skinImage: SkinImage;
	public readonly animations: SkinAnimation[];
	public readonly cape: SkinCape;
	public readonly geometry: string;
	public readonly animationData: string;
	public readonly premium: boolean;
	public readonly persona: boolean;
	public readonly capeOnClassic: boolean;
	public readonly armSize: string;
	public readonly personaData?: SkinPersona;
	public readonly isTrusted: boolean;
	public readonly fullId: string;

	public constructor(data: ClientData) {
		this.id = data.SkinId;
		this.playFabId = data.PlayFabId;
		this.resourcePatch = Buffer.from(data.SkinResourcePatch, 'base64').toString();

		this.skinImage = {
			width: data.SkinImageWidth,
			height: data.SkinImageHeight,
			data: Buffer.from(data.SkinData, 'base64'),
		};

		this.animations = [];
		for (const animation of data.AnimatedImageData) {
			this.animations.push({
				frames: animation.Frames,
				type: animation.Type,
				expression: animation.AnimationExpression,
				image: {
					width: animation.ImageWidth,
					height: animation.ImageHeight,
					data: Buffer.from(animation.Image, 'base64'),
				},
			});
		}

		this.cape = {
			id: data.CapeId,
			image: {
				width: data.CapeImageWidth,
				height: data.CapeImageHeight,
				data: Buffer.from(data.CapeData, 'base64'),
			},
		};

		this.color = data.SkinColor;
		this.armSize = data.ArmSize;

		this.geometry = Buffer.from(data.SkinGeometryData, 'base64').toString();
		this.animationData = Buffer.from(data.SkinAnimationData, 'base64').toString();
		this.premium = data.PremiumSkin;

		this.persona = data.PersonaSkin;
		if (this.persona) {
			this.personaData = {
				pieces: [],
				tintColors: [],
			};

			for (const piece of data.PersonaPieces) {
				this.personaData.pieces.push({
					def: piece.IsDefault,
					packId: piece.PackId,
					pieceId: piece.PieceId,
					pieceType: piece.PieceType,
					productId: piece.ProductId,
				});
			}

			for (const tint of data.PieceTintColors) {
				this.personaData.tintColors.push({
					colors: tint.Colors,
					type: tint.PieceType,
				});
			}
		}

		this.capeOnClassic = data.CapeOnClassicSkin;
		this.isTrusted = data.TrustedSkin;
		this.fullId = data.SkinId + data.CapeId;
	}

	public serialize(): Buffer {
		const stream = new BinaryStream();
		stream.writeVarString(this.id);
		stream.writeVarString(this.playFabId);
		stream.writeVarString(this.resourcePatch);

		// Image
		stream.writeInt32(this.skinImage.width, Endianness.Little);
		stream.writeInt32(this.skinImage.height, Endianness.Little);
		stream.writeVarInt(this.skinImage.data.length);
		stream.writeBuffer(this.skinImage.data);

		// Animations
		stream.writeInt32(this.animations.length, Endianness.Little);
		for (const animation of this.animations) {
			// Image
			stream.writeInt32(animation.image.width, Endianness.Little);
			stream.writeInt32(animation.image.height, Endianness.Little);
			stream.writeVarInt(animation.image.data.length);
			stream.writeBuffer(animation.image.data);

			stream.writeInt32(animation.type, Endianness.Little);
			stream.writeFloat32(animation.frames, Endianness.Little);
			stream.writeFloat32(animation.expression, Endianness.Little);
		}

		// Cape Image
		stream.writeInt32(this.cape.image.width, Endianness.Little);
		stream.writeInt32(this.cape.image.height, Endianness.Little);
		stream.writeVarInt(this.cape.image.data.length);
		stream.writeBuffer(this.cape.image.data);

		stream.writeVarString(this.geometry);
		stream.writeVarString('0.0.0');
		stream.writeVarString(this.animationData);
		stream.writeVarString(this.cape.id);
		stream.writeVarString(this.fullId);
		stream.writeVarString(this.armSize);
		stream.writeVarString(this.color);

		// Persona
		if (this.persona) {
			stream.writeInt32(this.personaData!.pieces.length, Endianness.Little);
			for (const piece of this.personaData!.pieces) {
				stream.writeVarString(piece.pieceId);
				stream.writeVarString(piece.pieceType);
				stream.writeVarString(piece.packId);
				stream.writeBool(piece.def);
				stream.writeVarString(piece.productId);
			}

			stream.writeInt32(this.personaData!.tintColors.length, Endianness.Little);
			for (const tint of this.personaData!.tintColors) {
				stream.writeVarString(tint.type);
				stream.writeInt32(tint.colors.length, Endianness.Little);
				for (const color of tint.colors) {
					stream.writeVarString(color);
				}
			}
		} else {
			stream.writeInt32(0, Endianness.Little);
			stream.writeInt32(0, Endianness.Little);
		}

		stream.writeBool(this.premium);
		stream.writeBool(this.persona);
		stream.writeBool(this.capeOnClassic);
		stream.writeBool(false);
		stream.writeBool(true);

		return stream.getBuffer();
	}
}

export { Skin };
