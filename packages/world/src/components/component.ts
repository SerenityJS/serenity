/**
 * The base class for all components.
 */
class Component {
	/**
	 * The identifier for the component.
	 */
	public static readonly identifier: string;

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
	 * Called when the component is ticked.
	 */
	public onTick?(): void;
}

export { Component };
