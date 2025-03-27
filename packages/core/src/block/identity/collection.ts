import { CompoundTag } from "@serenityjs/nbt";

import { MaterialInstanceProperties } from "../../types";

import { BlockPermutation } from "./permutation";
import { BlockType } from "./type";
import {
  BlockTypeCollisionBoxComponent,
  BlockTypeCraftingTableComponent,
  BlockTypeFrictionComponent,
  BlockTypeGeometryComponent,
  BlockTypeHardnessComponent,
  BlockTypeInteractableComponent,
  BlockTypeLightEmissionComponent,
  BlockTypeMaterialInstancesComponent,
  BlockTypeSelectionBoxComponent,
  type BlockTypeComponent
} from "./components";

class BlockTypeComponentCollection extends CompoundTag<unknown> {
  /**
   * The type of block that the properties are for.
   */
  protected readonly block: BlockType | BlockPermutation;

  /**
   * The component definitions of the block type.
   */
  public readonly entries = new Map<string, BlockTypeComponent>();

  /**
   * Create a new block property collection.
   * @param block The block type that the properties are for.
   */
  public constructor(block: BlockType | BlockPermutation) {
    // The name of the compound tag.
    super({ name: "components" });

    // Set the block type that the properties are for.
    this.block = block;
  }

  /**
   * Gets a property from the block.
   * @param property The property to get.
   * @returns The property instance.
   */
  public get<T extends typeof BlockTypeComponent>(
    property: T
  ): InstanceType<T> {
    return this.entries.get(property.identifier) as InstanceType<T>;
  }

  /**
   * Checks if the block has a property.
   * @param property The property to check.
   * @returns True if the block has the property, false otherwise.
   */
  public has<T extends typeof BlockTypeComponent>(property: T): boolean {
    return this.entries.has(property.identifier);
  }

  /**
   * Adds a new property to the block.
   * @param property The property to add.
   * @returns The property instance.
   */
  public add<
    T extends typeof BlockTypeComponent,
    A extends ConstructorParameters<T>[1]
  >(property: T, ...args: [A]): InstanceType<T> {
    // Check if the component already exists.
    if (this.entries.has(property.identifier))
      return this.entries.get(property.identifier) as InstanceType<T>;

    // Create the new component.
    const component = new property(this.block, ...args);

    // Add the component to the collection.
    this.entries.set(property.identifier, component);

    // Return the component.
    return component as InstanceType<T>;
  }

  /**
   * Removes a property from the block.
   * @param property The property to remove.
   */
  public remove<T extends typeof BlockTypeComponent>(property: T): void {
    // Check if the component exists.
    if (!this.entries.has(property.identifier)) return;

    // Remove the component from the collection.
    this.entries.delete(property.identifier);

    // Remove the component from the compound tag.
    this.removeTag(property.identifier);
  }

  /**
   * Get the hardness component value of the block.
   * @returns The hardness value of the block.
   */
  public getHardness(): number {
    // Check if the hardness component exists.
    if (this.has(BlockTypeHardnessComponent)) {
      // Return the hardness value of the component.
      return this.get(BlockTypeHardnessComponent).hardness;
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
    if (this.has(BlockTypeHardnessComponent)) {
      // Set the hardness value of the component.
      this.get(BlockTypeHardnessComponent)!.hardness = value;
    } else {
      // Add the hardness component to the block.
      this.add(BlockTypeHardnessComponent, value);
    }
  }

  /**
   * Get the friction component value of the block.
   * @returns The friction value of the block.
   */
  public getFriction(): number {
    // Check if the friction component exists.
    if (this.has(BlockTypeFrictionComponent)) {
      // Return the friction value of the component.
      return this.get(BlockTypeFrictionComponent)!.friction;
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
    if (this.has(BlockTypeFrictionComponent)) {
      // Set the friction value of the component.
      this.get(BlockTypeFrictionComponent)!.friction = value;
    } else {
      // Add the friction component to the block.
      this.add(BlockTypeFrictionComponent, value);
    }
  }

  /**
   * Get the light emission component value of the block.
   * @returns The light emission value of the block.
   */
  public getLightEmission(): number {
    // Check if the light emission component exists.
    if (this.has(BlockTypeLightEmissionComponent)) {
      // Return the light emission value of the component.
      return this.get(BlockTypeLightEmissionComponent)!.lightEmission;
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
    if (this.has(BlockTypeLightEmissionComponent)) {
      // Set the light emission value of the component.
      this.get(BlockTypeLightEmissionComponent)!.lightEmission = value;
    } else {
      // Add the light emission component to the block.
      this.add(BlockTypeLightEmissionComponent, value);
    }
  }

  /**
   * Get whether the block is interactable.
   * @returns True if the block is interactable, false otherwise.
   */
  public getIsInteractable(): boolean {
    return this.has(BlockTypeInteractableComponent);
  }

  /**
   * Set whether the block is interactable.
   * @param value True if the block is interactable, false otherwise.
   */
  public setIsInteractable(value: boolean): void {
    // Check if component should be added or removed.
    if (value) this.add(BlockTypeInteractableComponent, undefined);
    else this.remove(BlockTypeInteractableComponent);
  }

  /**
   * Get the geometry component of the block.
   * @returns The geometry component of the block.
   */
  public getGeometry(): BlockTypeGeometryComponent {
    // Check if the geometry component exists.
    if (!this.has(BlockTypeGeometryComponent)) {
      // Add the geometry component to the block.
      return this.add(BlockTypeGeometryComponent, {});
    }

    // Return the geometry component
    return this.get(BlockTypeGeometryComponent)!;
  }

  /**
   * Set the geometry component of the block.
   * @param properties The properties of the geometry component.
   * @returns The geometry component of the block.
   */
  public setGeometry(
    properties?: Partial<BlockTypeGeometryComponent>
  ): BlockTypeGeometryComponent {
    // Check if the geometry component exists.
    if (!this.has(BlockTypeGeometryComponent)) {
      // Add the geometry component to the block.
      this.add(BlockTypeGeometryComponent, properties);
    } else {
      // Get the geometry component of the block.
      const geometry = this.getGeometry();

      // Check if the properties are defined.
      if (properties) {
        // Assign the properties to the geometry component.
        Object.assign(geometry, properties);
      }
    }

    // Return the geometry component.
    return this.getGeometry();
  }

  /**
   * Get the material instances component of the block.
   * @returns The material instances component of the block.
   */
  public getMaterialInstances(): BlockTypeMaterialInstancesComponent {
    // Check if the material instances component exists.
    if (!this.has(BlockTypeMaterialInstancesComponent)) {
      // Add the material instances component to the block.
      return this.add(BlockTypeMaterialInstancesComponent, {});
    }

    // Return the material instances component
    return this.get(BlockTypeMaterialInstancesComponent)!;
  }

  /**
   * Set the material instances component of the block.
   * @param properties The properties of the material instances component.
   * @returns The material instances component of the block.
   */
  public setMaterialInstances(
    properties?: Record<string, MaterialInstanceProperties>
  ): BlockTypeMaterialInstancesComponent {
    // Check if the material instances component exists.
    if (!this.has(BlockTypeMaterialInstancesComponent)) {
      // Add the material instances component to the block.
      this.add(BlockTypeMaterialInstancesComponent, properties);
    } else {
      // Get the material instances component of the block.
      const materialInstances = this.getMaterialInstances();

      // Check if the properties are defined.
      if (properties) {
        // Assign the properties to the material instances component.
        Object.assign(materialInstances, properties);
      }
    }

    // Return the material instances component.
    return this.getMaterialInstances();
  }

  /**
   * Get the selection box component of the block.
   * @returns The selection box component of the block.
   */
  public getSelectionBox(): BlockTypeSelectionBoxComponent {
    // Check if the selection box component exists.
    if (!this.has(BlockTypeSelectionBoxComponent)) {
      // Add the selection box component to the block.
      return this.add(BlockTypeSelectionBoxComponent, {});
    }

    // Return the selection box component
    return this.get(BlockTypeSelectionBoxComponent)!;
  }

  /**
   * Set the selection box component of the block.
   * @param properties The properties of the selection box component.
   * @returns The selection box component of the block.
   */
  public setSelectionBox(
    properties?: Partial<BlockTypeSelectionBoxComponent>
  ): BlockTypeSelectionBoxComponent {
    // Check if the selection box component exists.
    if (!this.has(BlockTypeSelectionBoxComponent)) {
      // Add the selection box component to the block.
      this.add(BlockTypeSelectionBoxComponent, properties);
    } else {
      // Get the selection box component of the block.
      const selectionBox = this.getSelectionBox();

      // Check if the properties are defined.
      if (properties) {
        // Assign the properties to the selection box component.
        Object.assign(selectionBox, properties);
      }
    }

    // Return the selection box component.
    return this.getSelectionBox();
  }

  /**
   * Get the collision box component of the block.
   * @returns The collision box component of the block.
   */
  public getCollisionBox(): BlockTypeCollisionBoxComponent {
    // Check if the collision box component exists.
    if (!this.has(BlockTypeCollisionBoxComponent)) {
      // Add the collision box component to the block.
      return this.add(BlockTypeCollisionBoxComponent, {});
    }

    // Return the collision box component
    return this.get(BlockTypeCollisionBoxComponent)!;
  }

  /**
   * Set the collision box component of the block.
   * @param properties The properties of the collision box component.
   * @returns The collision box component of the block.
   */
  public setCollisionBox(
    properties?: Partial<BlockTypeCollisionBoxComponent>
  ): BlockTypeCollisionBoxComponent {
    // Check if the collision box component exists.
    if (!this.has(BlockTypeCollisionBoxComponent)) {
      // Add the collision box component to the block.
      this.add(BlockTypeCollisionBoxComponent, properties);
    } else {
      // Get the collision box component of the block.
      const collisionBox = this.getCollisionBox();

      // Check if the properties are defined.
      if (properties) {
        // Assign the properties to the collision box component.
        Object.assign(collisionBox, properties);
      }
    }

    // Return the collision box component.
    return this.getCollisionBox();
  }

  /**
   * Get the crafting table component of the block.
   * @returns The crafting table component of the block.
   */
  public getCraftingTable(): BlockTypeCraftingTableComponent {
    // Check if the crafting table component exists.
    if (!this.has(BlockTypeCraftingTableComponent)) {
      // Add the crafting table component to the block.
      return this.add(BlockTypeCraftingTableComponent, {});
    }

    // Return the crafting table component
    return this.get(BlockTypeCraftingTableComponent)!;
  }

  /**
   * Set the crafting table component of the block.
   * @param properties The properties of the crafting table component.
   * @returns The crafting table component of the
   */
  public setCraftingTable(
    properties?: Partial<BlockTypeCraftingTableComponent>
  ): BlockTypeCraftingTableComponent {
    // Check if the crafting table component exists.
    if (!this.has(BlockTypeCraftingTableComponent)) {
      // Add the crafting table component to the block.
      this.add(BlockTypeCraftingTableComponent, properties);
    } else {
      // Get the crafting table component of the block.
      const craftingTable = this.getCraftingTable();

      // Check if the properties are defined.
      if (properties) {
        // Assign the properties to the crafting table component.
        Object.assign(craftingTable, properties);
      }
    }

    // Return the crafting table component.
    return this.getCraftingTable();
  }
}

export { BlockTypeComponentCollection };
