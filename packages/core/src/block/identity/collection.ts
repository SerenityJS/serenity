import { CompoundTag } from "@serenityjs/nbt";

import {
  type BlockTypeComponent,
  type MaterialInstanceOptions,
  type BlockTypeCollisionBoxComponentOptions,
  type BlockTypeCraftingTableComponentOptions,
  type BlockTypeGeometryComponentOptions,
  type BlockTypeMaterialInstancesComponentOptions,
  type BlockTypeSelectionBoxComponentOptions,
  type BlockTypeTransformationComponentOptions,
  BlockTypeCollisionBoxComponent,
  BlockTypeCraftingTableComponent,
  BlockTypeFrictionComponent,
  BlockTypeGeometryComponent,
  BlockTypeDestructableByMiningComponent,
  BlockTypeInteractableComponent,
  BlockTypeLightEmissionComponent,
  BlockTypeMaterialInstancesComponent,
  BlockTypeSelectionBoxComponent,
  BlockTypeTransformationComponent,
  BlockTypeDisplayNameComponent,
  BlockTypeLightDampeningComponent
} from "./components";

import type { BlockType } from "./type";
import type { BlockPermutation } from "./permutation";

class BlockTypeComponentCollection extends CompoundTag {
  /**
   * The type of block that the properties are for.
   */
  protected readonly block: BlockType | BlockPermutation;

  /**
   * The component definitions of the block type.
   */
  public readonly components = new Map<string, BlockTypeComponent>();

  /**
   * Create a new block property collection.
   * @param block The block type that the properties are for.
   */
  public constructor(block: BlockType | BlockPermutation) {
    // The name of the compound tag.
    super("components");

    // Set the block type that the properties are for.
    this.block = block;
  }

  /**
   * Gets a property from the block.
   * @param property The property to get.
   * @returns The property instance.
   */
  public getComponent<T extends typeof BlockTypeComponent>(
    property: T
  ): InstanceType<T> {
    return this.components.get(property.identifier) as InstanceType<T>;
  }

  /**
   * Checks if the block has a property.
   * @param property The property to check.
   * @returns True if the block has the property, false otherwise.
   */
  public hasComponent<T extends typeof BlockTypeComponent>(
    property: T | string
  ): boolean {
    // Get the identifier of the property.
    const identifier =
      typeof property === "string" ? property : property.identifier;

    // Return true if the block has the property, false otherwise.
    return this.components.has(identifier);
  }

  /**
   * Adds a new property to the block.
   * @param property The property to add.
   * @returns The property instance.
   */
  public addComponent<
    T extends typeof BlockTypeComponent,
    A extends ConstructorParameters<T>[1]
  >(property: T, ...args: [A]): InstanceType<T> {
    // Check if the component already exists.
    if (this.components.has(property.identifier))
      return this.components.get(property.identifier) as InstanceType<T>;

    // Create the new component.
    const component = new property(this.block, ...args);

    // Add the component to the collection.
    this.components.set(property.identifier, component);

    // Return the component.
    return component as InstanceType<T>;
  }

  /**
   * Removes a property from the block.
   * @param property The property to remove.
   */
  public removeComponent<T extends typeof BlockTypeComponent>(
    property: T
  ): void {
    // Check if the component exists.
    if (!this.components.has(property.identifier)) return;

    // Remove the component from the collection.
    this.components.delete(property.identifier);

    // Remove the component from the compound tag.
    this.delete(property.identifier);
  }

  /**
   * Get whether the block has a hardness component.
   * @returns True if the block has a hardness component, false otherwise.
   */
  public hasHardness(): boolean {
    return this.hasComponent(BlockTypeDestructableByMiningComponent);
  }

  /**
   * Get the hardness component value of the block.
   * @returns The hardness value of the block.
   */
  public getHardness(): number {
    // Check if the hardness component exists.
    if (this.hasComponent(BlockTypeDestructableByMiningComponent)) {
      // Return the hardness value of the component.
      return this.getComponent(
        BlockTypeDestructableByMiningComponent
      ).getHardness();
    }

    // Return the default hardness value.
    return 0;
  }

  /**
   * Set the hardness component value of the block.
   * @param value The hardness value to set.
   */
  public setHardness(value: number): void {
    // Check if the hardness component exists.
    if (this.hasComponent(BlockTypeDestructableByMiningComponent)) {
      // Set the hardness value of the component.
      this.getComponent(BlockTypeDestructableByMiningComponent).setHardness(
        value
      );
    } else {
      // Add the hardness component to the block.
      this.addComponent(BlockTypeDestructableByMiningComponent, value);
    }
  }

  /**
   * Get whether the block has a friction component.
   * @returns True if the block has a friction component, false otherwise.
   */
  public hasFriction(): boolean {
    return this.hasComponent(BlockTypeFrictionComponent);
  }

  /**
   * Get the friction component value of the block.
   * @returns The friction value of the block.
   */
  public getFriction(): number {
    // Check if the friction component exists.
    if (this.hasComponent(BlockTypeFrictionComponent)) {
      // Return the friction value of the component.
      return this.getComponent(BlockTypeFrictionComponent).getFriction();
    }

    // Return the default friction value.
    return 0.6;
  }

  /**
   * Set the friction component value of the block.
   * @param value The friction value to set.
   */
  public setFriction(value: number): void {
    // Check if the friction component exists.
    if (this.hasComponent(BlockTypeFrictionComponent)) {
      // Set the friction value of the component.
      this.getComponent(BlockTypeFrictionComponent).setFriction(value);
    } else {
      // Add the friction component to the block.
      this.addComponent(BlockTypeFrictionComponent, value);
    }
  }

  /**
   * Get whether the block has a light emission component.
   * @returns True if the block has a light emission component, false otherwise.
   */
  public hasLightEmission(): boolean {
    return this.hasComponent(BlockTypeLightEmissionComponent);
  }

  /**
   * Get the light emission component value of the block.
   * @returns The light emission value of the block.
   */
  public getLightEmission(): number {
    // Check if the light emission component exists.
    if (this.hasComponent(BlockTypeLightEmissionComponent)) {
      // Return the light emission value of the component.
      return this.getComponent(
        BlockTypeLightEmissionComponent
      ).getLightEmission();
    }

    // Return the default light emission value.
    return 0;
  }

  /**
   * Set the light emission component value of the block.
   * @param value The light emission value to set.
   */
  public setLightEmission(value: number): void {
    // Check if the light emission component exists.
    if (this.hasComponent(BlockTypeLightEmissionComponent)) {
      // Set the light emission value of the component.
      this.getComponent(BlockTypeLightEmissionComponent).setLightEmission(
        value
      );
    } else {
      // Add the light emission component to the block.
      this.addComponent(BlockTypeLightEmissionComponent, value);
    }
  }

  /**
   * Whether the block has a light dampening component.
   * @returns True if the block has a light dampening component, false otherwise.
   */
  public hasLightDampening(): boolean {
    return this.hasComponent(BlockTypeLightDampeningComponent);
  }

  /**
   * Get the light dampening value of the block.
   * @returns The light dampening value of the block.
   */
  public getLightDampening(): number {
    // Check if the light dampening component exists.
    if (this.hasComponent(BlockTypeLightDampeningComponent)) {
      // Return the light dampening value of the component.
      return this.getComponent(
        BlockTypeLightDampeningComponent
      ).getLightDampening();
    }

    // Return the default light dampening value.
    return 0;
  }

  /**
   * Set the light dampening value of the block.
   * @param value The light dampening value to set.
   */
  public setLightDampening(value: number): void {
    // Check if the light dampening component exists.
    if (this.hasComponent(BlockTypeLightDampeningComponent)) {
      // Set the light dampening value of the component.
      this.getComponent(BlockTypeLightDampeningComponent).setLightDampening(
        value
      );
    } else {
      // Add the light dampening component to the block.
      this.addComponent(BlockTypeLightDampeningComponent, value);
    }
  }

  /**
   * Get whether the block has a interactable component.
   * @returns True if the block has a interactable component, false otherwise.
   */
  public hasInteractable(): boolean {
    return this.hasComponent(BlockTypeInteractableComponent);
  }

  /**
   * Get whether the block is interactable.
   * @returns True if the block is interactable, false otherwise.
   */
  public getIsInteractable(): boolean {
    return this.hasComponent(BlockTypeInteractableComponent);
  }

  /**
   * Set whether the block is interactable.
   * @param value True if the block is interactable, false otherwise.
   */
  public setIsInteractable(value: boolean): void {
    // Check if component should be added or removed.
    if (value) this.addComponent(BlockTypeInteractableComponent, undefined);
    else this.removeComponent(BlockTypeInteractableComponent);
  }

  /**
   * Get whether the block has a display name component.
   * @returns True if the block has a display name component, false otherwise.
   */
  public hasDisplayName(): boolean {
    return this.hasComponent(BlockTypeDisplayNameComponent);
  }

  /**
   * Get the display name component of the block.
   * @returns The display name component of the block.
   */
  public getDisplayName(): string {
    // Check if the display name component exists.
    if (!this.hasComponent(BlockTypeDisplayNameComponent)) {
      // Add the display name component to the block.
      return this.addComponent(
        BlockTypeDisplayNameComponent,
        ""
      ).getDisplayName();
    }

    // Return the display name component
    return this.getComponent(BlockTypeDisplayNameComponent).getDisplayName();
  }

  /**
   * Set the display name component of the block.
   * @param value The display name of the block.
   */
  public setDisplayName(value: string): void {
    // Check if the display name component exists.
    if (!this.hasComponent(BlockTypeDisplayNameComponent)) {
      // Add the display name component to the block.
      this.addComponent(BlockTypeDisplayNameComponent, value);
    } else {
      // Set the display name of the block.
      this.getComponent(BlockTypeDisplayNameComponent).setDisplayName(value);
    }
  }

  /**
   * Get the geometry component of the block.
   * @returns The geometry component of the block.
   */
  public hasGeometry(): boolean {
    return this.hasComponent(BlockTypeGeometryComponent);
  }

  /**
   * Get the geometry component of the block.
   * @returns The geometry component of the block.
   */
  public getGeometry(): BlockTypeGeometryComponent {
    // Check if the geometry component exists.
    if (!this.hasComponent(BlockTypeGeometryComponent)) {
      // Add the geometry component to the block.
      return this.addComponent(BlockTypeGeometryComponent, {});
    }

    // Return the geometry component
    return this.getComponent(BlockTypeGeometryComponent)!;
  }

  /**
   * Set the geometry component of the block.
   * @param options The options of the geometry component.
   * @returns The geometry component of the block.
   */
  public setGeometry(
    options?: Partial<BlockTypeGeometryComponentOptions>
  ): BlockTypeGeometryComponent {
    // Check if the geometry component exists.
    if (!this.hasComponent(BlockTypeGeometryComponent)) {
      // Add the geometry component to the block.
      this.addComponent(BlockTypeGeometryComponent, options);
    } else {
      // Get the geometry component of the block.
      const geometry = this.getGeometry();

      // Check if the model identifier is defined.
      if (options?.identifier) geometry.setModelIdentifier(options.identifier);
    }

    // Return the geometry component.
    return this.getGeometry();
  }

  /**
   * Get the material instances component of the block.
   * @returns The material instances component of the block.
   */
  public hasMaterialInstances(): boolean {
    return this.hasComponent(BlockTypeMaterialInstancesComponent);
  }

  /**
   * Get the material instances component of the block.
   * @returns The material instances component of the block.
   */
  public getMaterialInstances(): BlockTypeMaterialInstancesComponent {
    // Check if the material instances component exists.
    if (!this.hasComponent(BlockTypeMaterialInstancesComponent)) {
      // Add the material instances component to the block.
      return this.addComponent(BlockTypeMaterialInstancesComponent, {});
    }

    // Return the material instances component
    return this.getComponent(BlockTypeMaterialInstancesComponent)!;
  }

  /**
   * Set the material instances component of the block.
   * @param options The options of the material instances component.
   * @returns The material instances component of the block.
   */
  public setMaterialInstances(
    options?: Partial<BlockTypeMaterialInstancesComponentOptions>
  ): BlockTypeMaterialInstancesComponent {
    // Check if the material instances component exists.
    if (!this.hasComponent(BlockTypeMaterialInstancesComponent)) {
      // Add the material instances component to the block.
      this.addComponent(BlockTypeMaterialInstancesComponent, options);
    } else {
      // Get the material instances component of the block.
      const materialInstances = this.getMaterialInstances();

      // Check if the materials are defined.
      if (options) {
        // Iterate over the materials.
        for (const key in options) {
          // Get the material instance options.
          const instance = options[key] as MaterialInstanceOptions;

          // Create a new material instance.
          materialInstances.createMaterialInstance(key, instance);
        }
      }
    }

    // Return the material instances component.
    return this.getMaterialInstances();
  }

  /**
   * Get the selection box component of the block.
   * @returns The selection box component of the block.
   */
  public hasSelectionBox(): boolean {
    return this.hasComponent(BlockTypeSelectionBoxComponent);
  }

  /**
   * Get the selection box component of the block.
   * @returns The selection box component of the block.
   */
  public getSelectionBox(): BlockTypeSelectionBoxComponent {
    // Check if the selection box component exists.
    if (!this.hasComponent(BlockTypeSelectionBoxComponent)) {
      // Add the selection box component to the block.
      return this.addComponent(BlockTypeSelectionBoxComponent, {});
    }

    // Return the selection box component
    return this.getComponent(BlockTypeSelectionBoxComponent)!;
  }

  /**
   * Set the selection box component of the block.
   * @param options The options of the selection box component.
   * @returns The selection box component of the block.
   */
  public setSelectionBox(
    options?: Partial<BlockTypeSelectionBoxComponentOptions>
  ): BlockTypeSelectionBoxComponent {
    // Check if the selection box component exists.
    if (!this.hasComponent(BlockTypeSelectionBoxComponent)) {
      // Add the selection box component to the block.
      this.addComponent(BlockTypeSelectionBoxComponent, options);
    } else {
      // Get the selection box component of the block.
      const selectionBox = this.getSelectionBox();

      // Check if the origin is defined.
      if (options?.origin) selectionBox.setOrigin(options.origin);

      // Check if the size is defined.
      if (options?.size) selectionBox.setSize(options.size);
    }

    // Return the selection box component.
    return this.getSelectionBox();
  }

  /**
   * Get the collision box component of the block.
   * @returns True if the block has a collision box component, false otherwise.
   */
  public hasCollisionBox(): boolean {
    return this.hasComponent(BlockTypeCollisionBoxComponent);
  }

  /**
   * Get the collision box component of the block.
   * @returns The collision box component of the block.
   */
  public getCollisionBox(): BlockTypeCollisionBoxComponent {
    // Check if the collision box component exists.
    if (!this.hasComponent(BlockTypeCollisionBoxComponent)) {
      // Add the collision box component to the block.
      return this.addComponent(BlockTypeCollisionBoxComponent, {});
    }

    // Return the collision box component
    return this.getComponent(BlockTypeCollisionBoxComponent)!;
  }

  /**
   * Set the collision box component of the block.
   * @param options The options of the collision box component.
   * @returns The collision box component of the block.
   */
  public setCollisionBox(
    options?: Partial<BlockTypeCollisionBoxComponentOptions>
  ): BlockTypeCollisionBoxComponent {
    // Check if the collision box component exists.
    if (!this.hasComponent(BlockTypeCollisionBoxComponent)) {
      // Add the collision box component to the block.
      this.addComponent(BlockTypeCollisionBoxComponent, options);
    } else {
      // Get the collision box component of the block.
      const collisionBox = this.getCollisionBox();

      // Check if the origin is defined.
      if (options?.boxes) collisionBox.setBoxes(options.boxes);
    }

    // Return the collision box component.
    return this.getCollisionBox();
  }

  /**
   * Get the crafting table component of the block.
   * @returns True if the block has a crafting table component, false otherwise.
   */
  public hasCraftingTable(): boolean {
    return this.hasComponent(BlockTypeCraftingTableComponent);
  }

  /**
   * Get the crafting table component of the block.
   * @returns The crafting table component of the block.
   */
  public getCraftingTable(): BlockTypeCraftingTableComponent {
    // Check if the crafting table component exists.
    if (!this.hasComponent(BlockTypeCraftingTableComponent)) {
      // Add the crafting table component to the block.
      return this.addComponent(BlockTypeCraftingTableComponent, {});
    }

    // Return the crafting table component
    return this.getComponent(BlockTypeCraftingTableComponent)!;
  }

  /**
   * Set the crafting table component of the block.
   * @param properties The properties of the crafting table component.
   * @returns The crafting table component of the block.
   */
  public setCraftingTable(
    options?: Partial<BlockTypeCraftingTableComponentOptions>
  ): BlockTypeCraftingTableComponent {
    // Check if the crafting table component exists.
    if (!this.hasComponent(BlockTypeCraftingTableComponent)) {
      // Add the crafting table component to the block.
      this.addComponent(BlockTypeCraftingTableComponent, options);
    } else {
      // Get the crafting table component of the block.
      const craftingTable = this.getCraftingTable();

      // Check if the table name is defined.
      if (options?.table_name) craftingTable.setTableName(options.table_name);

      // Check if the crafting tags are defined.
      if (options?.crafting_tags)
        craftingTable.setCraftingTags(options.crafting_tags);

      // Check if the grid size is defined.
      if (options?.grid_size) craftingTable.setGridSize(options.grid_size);
    }

    // Return the crafting table component.
    return this.getCraftingTable();
  }

  /**
   * Get the transformation component of the block.
   * @returns The transformation component of the block.
   */
  public getTransformation(): BlockTypeTransformationComponent {
    // Check if the transformation component exists.
    if (!this.hasComponent(BlockTypeTransformationComponent)) {
      // Add the transformation component to the block.
      return this.addComponent(BlockTypeTransformationComponent, {});
    }

    // Return the transformation component
    return this.getComponent(BlockTypeTransformationComponent);
  }

  /**
   * Set the transformation component of the block.
   * @param options The options of the transformation component.
   * @returns The transformation component of the block.
   */
  public setTransformation(
    options?: Partial<BlockTypeTransformationComponentOptions>
  ): BlockTypeTransformationComponent {
    // Check if the transformation component exists.
    if (!this.hasComponent(BlockTypeTransformationComponent)) {
      // Add the transformation component to the block.
      this.addComponent(BlockTypeTransformationComponent, options);
    } else {
      // Get the transformation component of the block.
      const transformation = this.getTransformation();

      // Check if the translation is defined.
      if (options?.translation)
        transformation.setTranslation(options.translation);

      // Check if the rotation is defined.
      if (options?.rotation) transformation.setRotation(options.rotation);

      // Check if the scale is defined.
      if (options?.scale) transformation.setScale(options.scale);

      // Check if the rotation pivot is defined.
      if (options?.rotation_pivot)
        transformation.setRotationPivot(options.rotation_pivot);

      // Check if the scale pivot is defined.
      if (options?.scale_pivot)
        transformation.setScalePivot(options.scale_pivot);
    }

    // Return the transformation component.
    return this.getTransformation();
  }
}

export { BlockTypeComponentCollection };
