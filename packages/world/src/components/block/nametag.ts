import { type CompoundTag, StringTag } from "@serenityjs/nbt";

import { BlockComponent } from "./block-component";

import type { Block } from "../../block";

class BlockNametagComponent extends BlockComponent {
	public static readonly identifier = "minecraft:nametag";

	/**
	 * The default value of the nametag.
	 */
	public defaultValue = "Container";

	/**
	 * The current value of the nametag.
	 */
	public currentValue = this.defaultValue;

	/**
	 * Creates a new block nametag component.
	 *
	 * @param block The block the component is binded to.
	 * @returns A new block nametag component.
	 */
	public constructor(block: Block) {
		super(block, BlockNametagComponent.identifier);
	}

	/**
	 * Sets the current value of the nametag.
	 * @param value The value to set the nametag to.
	 */
	public setCurrentValue(value: string): void {
		// Set the current value.
		this.currentValue = value;

		// Get the CustomName tag.
		const customName = this.block.hasNbtTag("CustomName")
			? this.block.nbt
			: new StringTag("CustomName", value);

		// Set the value of the tag.
		customName.setValue(value);

		// Set the nbt tag to the block.
		this.block.setNbtTag(customName);
	}

	/**
	 * Resets the nametag to the default value.
	 */
	public resetToDefault(): void {
		this.setCurrentValue(this.defaultValue);
	}

	public static serialize(
		nbt: CompoundTag,
		component: BlockNametagComponent
	): void {
		// Create the CustomName tag.
		nbt.createStringTag("CustomName", component.currentValue);
	}

	public static deserialize(
		nbt: CompoundTag,
		block: Block
	): BlockNametagComponent {
		// Create the component.
		const component = new BlockNametagComponent(block);

		// Set the current value.
		component.setCurrentValue(nbt.getTag("CustomName")?.value as string);

		// Return the component.
		return component;
	}
}

export { BlockNametagComponent };
