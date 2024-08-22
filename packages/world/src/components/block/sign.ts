import { OpenSignPacket } from "@serenityjs/protocol";
import { ItemIdentifier } from "@serenityjs/item";
import { ByteTag, CompoundTag, IntTag, StringTag } from "@serenityjs/nbt";
import { BlockIdentifier } from "@serenityjs/block";

import { BlockComponent } from "./block-component";

import type { Block } from "../../block";
import type { Player } from "../../player";

interface SignTag extends CompoundTag {
	FrontText: CompoundTag<SignTextTag>;
	BackText: CompoundTag<SignTextTag>;
	IsWaxed: ByteTag;
	LockedForEditingBy: ByteTag;
	x: IntTag;
	y: IntTag;
	z: IntTag;
	id: StringTag;
	isMovable: ByteTag;
}

interface SignTextTag {
	HideGlowOutline: ByteTag;
	IgnoreLighting: ByteTag;
	PersistFormatting: ByteTag;
	SignTextColor: IntTag;
	Text: StringTag;
	TextOwner: StringTag;
}

interface SignText {
	HideGlowOutline: boolean;
	IgnoreLighting: boolean;
	PersistFormatting: boolean;
	TextColor: number;
	Text: string;
	TextOwner: string;
}

class BlockSignComponent extends BlockComponent {
	public static readonly identifier = "minecraft:sign";
	public static types: Array<BlockIdentifier> = [
		BlockIdentifier.StandingSign,
		BlockIdentifier.BirchStandingSign,
		BlockIdentifier.AcaciaStandingSign,
		BlockIdentifier.SpruceStandingSign,
		BlockIdentifier.BambooStandingSign,
		BlockIdentifier.CherryStandingSign,
		BlockIdentifier.JungleStandingSign,
		BlockIdentifier.WarpedStandingSign,
		BlockIdentifier.CrimsonStandingSign,
		BlockIdentifier.DarkoakStandingSign,
		BlockIdentifier.MangroveStandingSign,
		BlockIdentifier.OakHangingSign,
		BlockIdentifier.BirchHangingSign,
		BlockIdentifier.AcaciaHangingSign,
		BlockIdentifier.SpruceHangingSign,
		BlockIdentifier.BambooHangingSign,
		BlockIdentifier.CherryHangingSign,
		BlockIdentifier.JungleHangingSign,
		BlockIdentifier.WarpedHangingSign,
		BlockIdentifier.CrimsonHangingSign,
		BlockIdentifier.DarkOakHangingSign,
		BlockIdentifier.MangroveHangingSign
	];

	public isWaxed: boolean;
	public frontText!: SignText;
	public backText!: SignText;
	private tag!: CompoundTag<SignTag>;

	public constructor(block: Block) {
		super(block, BlockSignComponent.identifier);
		this.isWaxed = false;
	}

	public onPlace(player?: Player): void {
		if (!player) return;
		this.openSign(player, true);
	}

	public onInteract(player: Player): void {
		// Apply Glowing
		const heldItem = player.getComponent("minecraft:inventory").getHeldItem();

		switch (true) {
			case heldItem?.type.identifier == ItemIdentifier.Honeycomb &&
				!this.isWaxed: {
				this.isWaxed = true;
				heldItem.decrement(1);
				this.update();

				return;
			}
			case heldItem?.type.identifier == ItemIdentifier.GlowInkSac &&
				!this.frontText.IgnoreLighting: {
				this.frontText.HideGlowOutline = false;
				this.frontText.IgnoreLighting = true;
				heldItem.decrement(1);

				this.update();

				return;
			}
			case heldItem?.hasComponent("minecraft:dye"): {
				const dyeComponent = heldItem?.getComponent("minecraft:dye");

				if (this.frontText.TextColor == dyeComponent?.color.toInt()) return;
				this.frontText.TextColor = dyeComponent?.color.toInt() || -16_777_216;
				this.update();
				heldItem?.decrement(1);
				return;
			}
		}

		if (this.isWaxed) return;
		this.openSign(player, true);
	}

	public setText(text: string, side: "Front" | "Back") {
		if (!this.tag) throw new Error("Block doesnt have any defined data");
		if (side == "Front") {
			this.frontText.Text = text;
		} else this.backText.Text = text;
		this.update();
	}

	private openSign(player: Player, isFrontSide: boolean): void {
		const packet = new OpenSignPacket();
		packet.isFrontSide = isFrontSide; // TODO: Get this value based on the block and players direction
		packet.position = this.block.position;

		player.session.send(packet);
	}

	private update(): void {
		// ? Set block nbt tag
		this.tag = this.writeTag() as CompoundTag<SignTag>;
		this.block.nbt = this.tag;
		this.block.update();
	}

	private writeText(tagName: string, textData: SignText): unknown {
		const {
			Text,
			TextColor,
			TextOwner,
			IgnoreLighting,
			PersistFormatting,
			HideGlowOutline
		} = textData;
		const signTag = new CompoundTag(tagName, {}) as CompoundTag<SignTextTag>;

		return signTag.addTag(
			new StringTag("Text", Text),
			new IntTag("SignTextColor", TextColor),
			new ByteTag("HideGlowOutline", Number(HideGlowOutline)),
			new StringTag("TextOwner", TextOwner),
			new ByteTag("IgnoreLighting", Number(IgnoreLighting)),
			new ByteTag("PersistFormatting", Number(PersistFormatting))
		);
	}

	private writeTag(): unknown {
		const { isWaxed, frontText, backText } = this;

		return new CompoundTag("", {
			...this.tag.value,
			IsWaxed: new ByteTag("IsWaxed", Number(isWaxed)),
			FrontText: this.writeText("FrontText", frontText),
			BackText: this.writeText("BackText", backText)
		});
	}

	private readText(textTag: CompoundTag<SignTextTag>): SignText {
		const {
			Text,
			TextOwner,
			SignTextColor,
			HideGlowOutline,
			PersistFormatting,
			IgnoreLighting
		} = textTag.value;

		return {
			Text: Text.value,
			TextOwner: TextOwner.value,
			TextColor: SignTextColor.value,
			IgnoreLighting: Boolean(IgnoreLighting.value),
			PersistFormatting: Boolean(PersistFormatting.value),
			HideGlowOutline: Boolean(HideGlowOutline.value)
		};
	}

	public readTag(nbtData: unknown): void {
		this.tag = nbtData as CompoundTag<SignTag>;
		const { IsWaxed, FrontText, BackText } = this.tag.value;

		this.isWaxed = Boolean(IsWaxed.value);
		this.frontText = this.readText(FrontText);
		this.backText = this.readText(BackText);
	}
}

export { BlockSignComponent };
