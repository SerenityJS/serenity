import { Entity } from "../../entity";
import { Component } from "../component";

class EntityComponent extends Component {
	/**
	 * The entity the component is binded to.
	 */
	protected readonly entity: Entity;

	/**
	 * Creates a new entity component.
	 *
	 * @param entity The entity the component is binded to.
	 * @returns A new entity component.
	 */
	public constructor(entity: Entity) {
		super();
		this.entity = entity;
	}
}

export { EntityComponent };
