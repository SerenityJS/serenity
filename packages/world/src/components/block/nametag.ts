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

		// Check if a CustomName tag exists.
		if (this.block.nbt.hasTag("CustomName"))
			this.block.nbt.removeTag("CustomName");

		// Create a new CustomName tag.
		const customName = new StringTag("CustomName", value);

		// Add the CustomName tag to the block.
		this.block.nbt.addTag(customName);

		// Update the item in the container.
		this.block.update();
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
		nbt.createStringTag("CustomName", component.currentValue);
	}

	public static deserialize(
		nbt: CompoundTag,
		block: Block
	): BlockNametagComponent {
		const component = new BlockNametagComponent(block);
		component.setCurrentValue(nbt.getTag("CustomName")?.value as string);
		return component;
	}
}

export { BlockNametagComponent };
