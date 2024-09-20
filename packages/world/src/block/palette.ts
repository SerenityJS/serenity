import {
	BlockIdentifier,
	BlockType,
	BlockPermutation,
	CustomBlockType,
	type BlockState
} from "@serenityjs/block";

import { BlockEnum } from "../commands";
import { BLOCK_COMPONENTS, type BlockComponent } from "../components";

class BlockPalette {
	/**
	 * The registered block types for the palette.
	 */
	public readonly types = BlockType.types;

	/**
	 * The registered block permutations for the palette.
	 */
	public readonly permutations = BlockPermutation.permutations;

	/**
	 * The registered block components for the palette.
	 */
	public readonly components = new Map<string, typeof BlockComponent>();

	/**
	 * The registry for the block components.
	 */
	public readonly registry = new Map<
		BlockIdentifier,
		Array<typeof BlockComponent>
	>();

	public constructor() {
		// Register all block components.
		for (const component of BLOCK_COMPONENTS) this.registerComponent(component);
	}

	/**
	 * Gets all block types from the palette.
	 * @returns All block types from the palette.
	 */
	public getAllTypes(): Array<BlockType> {
		return [...this.types.values()];
	}

	/**
	 * Gets all custom block types from the palette.
	 */
	public getAllCustomTypes(): Array<CustomBlockType> {
		return [...this.types.values()].filter(
			(type) => type instanceof CustomBlockType
		) as Array<CustomBlockType>;
	}

	/**
	 * Gets all block permutations from the palette.
	 * @returns All block permutations from the palette.
	 */
	public getAllPermutations(): Array<BlockPermutation> {
		return [...this.permutations.values()];
	}

	/**
	 * Gets a block type from the palette.
	 * @param identifier The block identifier to get.
	 * @returns The block type from the palette.
	 */
	public resolveType(identifier: BlockIdentifier): BlockType {
		return this.types.get(identifier) as BlockType;
	}

	/**
	 * Resolves a block permutation from the block identifier and state.
	 * @param identifier The block identifier to resolve.
	 * @param state The block state to resolve.
	 * @returns The block permutation from the palette.
	 */
	public resolvePermutation<T extends keyof BlockState>(
		identifier: T,
		state?: BlockState[T]
	): BlockPermutation<T> {
		// Get the block type from the registry.
		const type = this.resolveType(identifier as BlockIdentifier);

		// Check if the block type exists.
		if (!type)
			return this.resolvePermutation(
				BlockIdentifier.Air
			) as BlockPermutation<T>;

		// Check if the state is not provided.
		const permutation = type.permutations.find((permutation) => {
			for (const key in state) {
				// Get the value of the block state.
				const value = (permutation.state as never)[key];

				// Check if the value is a boolean
				const bool = value === true || value === false ? true : false;

				// Convert the state to a boolean if it is a boolean.
				const query =
					bool && (state[key] === 0 || state[key] === 1)
						? state[key] === 1
						: state[key];

				// Check if the block state matches
				if (value !== query) {
					return false;
				}
			}

			// Return true if the block permutation matches.
			return true;
		});

		// Check if the block permutation does not exist.
		if (!permutation) {
			// Return the default permutation if the state is not found.
			return type.permutations[0] as BlockPermutation<T>;
		}

		// Return the block permutation.
		return permutation as BlockPermutation<T>;
	}

	/**
	 * Register a block type to the palette.
	 * @param type The block type to register.
	 * @returns Whether the block type was registered.
	 */
	public registerType(type: BlockType): boolean {
		// Check if the block type already exists.
		if (this.types.has(type.identifier)) return false;

		// Register the block type.
		this.types.set(type.identifier, type);

		// Register the permutations of the block type.
		for (const permutation of type.permutations) {
			this.registerPermutation(permutation);
		}

		// Register the block type to the BlockEnum.
		BlockEnum.options.push(type.identifier);

		// Return true if the block type was registered.
		return true;
	}

	/**
	 * Register a block permutation to the palette.
	 * @param permutation The block permutation to register.
	 * @returns Whether the block permutation was registered.
	 */
	public registerPermutation(permutation: BlockPermutation): boolean {
		// Check if the block permutation already exists.
		if (this.permutations.has(permutation.network)) return false;

		// Register the block permutation.
		this.permutations.set(permutation.network, permutation);

		// Return true if the block permutation was registered.
		return true;
	}

	/**
	 * Get the registry for the block identifier.
	 * @param type The block identifier to get the registry for.
	 * @returns The registry for the block identifier.
	 */
	public getRegistry(type: BlockIdentifier): Array<typeof BlockComponent> {
		// Get the registry for the block identifier.
		const registry = this.registry.get(type) || [];

		// Return the registry.
		return registry as Array<typeof BlockComponent>;
	}

	/**
	 * Register a component to the palette.
	 * @param component The component to register.
	 * @returns True if the component was registered, false otherwise.
	 */
	public registerComponent(component: typeof BlockComponent): boolean {
		// Check if the block component is already registered.
		if (this.components.has(component.identifier)) return false;

		// Register the block component.
		this.components.set(component.identifier, component);

		// Iterate over the types of the component.
		for (const type of component.types) {
			// Check if the registry has the block identifier.
			if (!this.registry.has(type))
				// Set the registry for the block identifier.
				this.registry.set(type, []);

			// Get the registry for the block identifier.
			const registry = this.registry.get(type);

			// Check if the registry exists.
			if (registry) {
				// Push the component to the registry.
				registry.push(component);

				// Set the registry for the block identifier.
				this.registry.set(type, registry);
			}
		}

		// Return true if the block component was registered.
		return true;
	}

	/**
	 * Remove a component from the palette.
	 * @param identifier The identifier of the component.
	 * @returns True if the component was removed, false otherwise.
	 */
	public removeComponent(identifier: string): boolean {
		// Check if the component exists.
		if (!this.components.has(identifier)) return false;

		// Get the component.
		const component = this.components.get(identifier);

		// Check if the component exists.
		if (!component) return false;

		// Iterate over the types of the component.
		for (const type of component.types) {
			// Get the registry for the block identifier.
			const registry = this.registry.get(type);

			// Check if the registry exists.
			if (registry) {
				// Remove the component from the registry.
				this.registry.set(
					type,
					registry.filter((component) => component.identifier !== identifier)
				);
			}
		}

		// Remove the component from the palette.
		this.components.delete(identifier);

		// Return true if the component was removed.
		return true;
	}

	/**
	 * Get all the components from the palette.
	 * @returns All the components from the palette.
	 */
	public getAllComponents(): Array<typeof BlockComponent> {
		return [...this.components.values()];
	}

	/**
	 * Get a component from the palette.
	 * @param identifier The identifier of the component.
	 * @returns The component from the palette.
	 */
	public getComponent(identifier: string): typeof BlockComponent | null {
		return this.components.get(identifier) ?? null;
	}
}

export { BlockPalette };
