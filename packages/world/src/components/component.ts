import type { CompoundTag } from "@serenityjs/nbt";

/**
 * The base class for all components.
 */
class Component {
	/**
	 * The identifier for the component.
	 */
	public static readonly identifier: string;

	/**
	 * The types to bind the component to.
	 */
	public static readonly types: Array<unknown>;

	/**
	 * The identifier of the component.
	 */
	public readonly identifier: string;

	/**
	 * Creates a new component.
	 *
	 * @param identifier The identifier of the component.
	 * @returns A new component.
	 */
	public constructor(identifier: string) {
		this.identifier = identifier;
	}

	/**
	 * Clones the component.
	 * @returns A new component.
	 */
	public clone(..._arguments_: Array<unknown>): Component {
		throw new Error("Method not implemented.");
	}

	/**
	 * Called when the component is ticked.
	 */
	public onTick?(deltaTick: number): void;

	/**
	 * Binds the component to the specified types.
	 */
	public static bind(): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Serializes the component.
	 * @param nbt The NBT tag to serialize to.
	 * @param component The component to serialize.
	 * @returns The serialized component.
	 */
	public static serialize(_nbt: CompoundTag, _component: Component): void {
		return;
	}

	/**
	 * Deserializes the component.
	 * @param nbt The NBT tag to deserialize from.
	 * @param unknown Unknown arguments.
	 * @returns The deserialized component.
	 */
	public static deserialize(
		_nbt: CompoundTag,
		..._unknown: Array<unknown>
	): Component {
		return new this(this.identifier);
	}
}

export { Component };
