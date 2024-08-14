import { DataType } from "@serenityjs/raknet";

import type { BinaryStream } from "@serenityjs/binarystream";
import type { EffectType } from "../../enums";

class ItemStackRequestActionBeanconPayment extends DataType {
	/**
	 * The primary effect of the item stack request action beacon payment.
	 */
	public readonly primaryEffect: EffectType;

	/**
	 * The secondary effect of the item stack request action
	 */
	public readonly secondaryEffect: EffectType;

	/**
	 * Creates a new instance of ItemStackRequestActionBeanconPayment.
	 * @param primaryEffect - The primary effect of the item stack request action beacon payment.
	 * @param secondaryEffect - The secondary effect of the item stack request action
	 */
	public constructor(primaryEffect: EffectType, secondaryEffect: EffectType) {
		super();
		this.primaryEffect = primaryEffect;
		this.secondaryEffect = secondaryEffect;
	}

	public static read(
		stream: BinaryStream
	): ItemStackRequestActionBeanconPayment {
		// Read the primary effect.
		const primaryEffect = stream.readZigZag();

		// Read the secondary effect.
		const secondaryEffect = stream.readZigZag();

		// Return the item stack request action.
		return new this(primaryEffect, secondaryEffect);
	}

	public static write(
		stream: BinaryStream,
		value: ItemStackRequestActionBeanconPayment
	): void {
		// Write the primary effect.
		stream.writeZigZag(value.primaryEffect);

		// Write the secondary effect.
		stream.writeZigZag(value.secondaryEffect);
	}
}

export { ItemStackRequestActionBeanconPayment };
