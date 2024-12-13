import { EntityGravityTrait } from "./gravity";
import { EntityTrait } from "./trait";

class EntityPhysicsTrait extends EntityTrait {
  public static readonly identifier = "physics";

  public gravity = 0.05;

  public onTick(): void {
    // Check if the entity is alive
    if (!this.entity.isAlive) return;

    // Check if the entity is colliding on the x axis
    if (this.isCollidingOnXAxis()) {
      // Set the entity's x velocity to 0
      this.entity.velocity.x = 0;
    } else {
      // Update the entity's x position
      this.entity.position.x += this.entity.velocity.x;
    }

    // Check if the entity is colliding on the y axis
    if (this.isCollidingOnYAxis()) {
      // Set the entity's y velocity to 0
      this.entity.velocity.y = 0;

      // Set the entity's on ground state to true
      this.entity.onGround = true;

      // Check if x or z velocity is not 0
      if (this.entity.velocity.x !== 0 || this.entity.velocity.z !== 0) {
        // Get the block below the entity
        const below = this.entity.dimension.getBlock({
          x: Math.floor(this.entity.position.x),
          y: Math.floor(this.entity.position.y - this.entity.hitboxHeight - 1),
          z: Math.floor(this.entity.position.z)
        });

        // Get the permutation properties of the block below the entity
        const properties = below.permutation.properties;

        // Create a friction factor based on the entity's gravity
        const factor = this.entity.hasTrait(EntityGravityTrait) ? 0.95 : 1;

        // Apply friction to the entity & apply friction to the entity
        if (this.entity.velocity.x !== 0)
          this.entity.velocity.x *= properties.friction * factor;

        // Apply friction to the entity
        if (this.entity.velocity.z !== 0)
          this.entity.velocity.z *= properties.friction * factor;
      }
    } else {
      // Update the entity's y position
      this.entity.position.y += this.entity.velocity.y;

      // Set the entity's on ground state to false
      this.entity.onGround = false;
    }

    // Check if the entity is colliding on the z axis
    if (this.isCollidingOnZAxis()) {
      // Set the entity's z velocity to 0
      this.entity.velocity.z = 0;
    } else {
      // Update the entity's z position
      this.entity.position.z += this.entity.velocity.z;
    }

    // Check if the entity's velocity is getting close to 0
    // If so, set the velocity to 0
    if (Math.abs(this.entity.velocity.x) < 0.001) this.entity.velocity.x = 0;
    if (Math.abs(this.entity.velocity.y) < 0.001) this.entity.velocity.y = 0;
    if (Math.abs(this.entity.velocity.z) < 0.001) this.entity.velocity.z = 0;

    // Apply gravity to the entity
    if (this.entity.hasTrait(EntityGravityTrait)) this.applyGravityTick();

    // Check if the entity is moving
    if (this.entity.velocity.isZero()) this.entity.isMoving = false;
    else this.entity.isMoving = true;
  }

  public isCollidingOnXAxis(): boolean {
    // Get the x velocity of the entity
    const velocity = this.entity.velocity.x;

    // Get the entity's position and dimension
    const { position, dimension, hitboxWidth, hitboxHeight } = this.entity;

    if (velocity > 0) {
      // Get the block in the direction the entity is moving
      const block = dimension.getBlock({
        x: Math.floor(position.x + velocity + hitboxWidth / 2),
        y: Math.floor(position.y - hitboxHeight),
        z: Math.floor(position.z)
      });

      // Check if the block in the direction the entity is moving is solid
      if (block.isSolid) {
        // Set the entity's x velocity to 0
        this.entity.velocity.x = 0;

        return true;
      } else return false;
    } else {
      // Get the block in the direction the entity is moving
      const block = dimension.getBlock({
        x: Math.floor(position.x + velocity - hitboxWidth / 2),
        y: Math.floor(position.y - hitboxHeight),
        z: Math.floor(position.z)
      });

      // Check if the block in the direction the entity is moving is solid
      if (block.isSolid) {
        // Set the entity's x velocity to 0
        this.entity.velocity.x = 0;

        return true;
      } else return false;
    }
  }

  public isCollidingOnYAxis(): boolean {
    // Get the y velocity of the entity
    const velocity = this.entity.velocity.y;

    // Get the entity's position and dimension
    const { position, dimension, hitboxHeight } = this.entity;

    if (velocity > 0) {
      // Get the block in the direction the entity is moving
      const block = dimension.getBlock({
        x: Math.floor(position.x),
        y: Math.floor(position.y + velocity + hitboxHeight),
        z: Math.floor(position.z)
      });

      // Check if the block in the direction the entity is moving is solid
      if (block.isSolid) {
        // Set the entity's y velocity to 0
        this.entity.velocity.y = 0;

        return true;
      } else return false;
    } else if (velocity < 0) {
      // Get the block in the direction the entity is moving
      const block = dimension.getBlock({
        x: Math.floor(position.x),
        y: Math.floor(position.y + velocity - hitboxHeight),
        z: Math.floor(position.z)
      });

      // Check if the block in the direction the entity is moving is solid
      if (block.isSolid) {
        // Set the entity's y velocity to 0
        this.entity.velocity.y = 0;

        return true;
      } else return false;
    } else {
      // Get the block in the direction the entity is moving
      const block = dimension.getBlock({
        x: Math.floor(position.x),
        y: Math.floor(position.y - 0.2 - hitboxHeight),
        z: Math.floor(position.z)
      });

      // Check if the block in the direction the entity is moving is solid
      if (block.isSolid) {
        return true;
      } else return false;
    }
  }

  public isCollidingOnZAxis(): boolean {
    // Get the z velocity of the entity
    const velocity = this.entity.velocity.z;

    // Get the entity's position and dimension
    const { position, dimension, hitboxWidth, hitboxHeight } = this.entity;

    if (velocity > 0) {
      // Get the block in the direction the entity is moving
      const block = dimension.getBlock({
        x: Math.floor(position.x),
        y: Math.floor(position.y - hitboxHeight),
        z: Math.floor(position.z + velocity + hitboxWidth / 2)
      });

      // Check if the block in the direction the entity is moving is solid
      if (block.isSolid) {
        // Set the entity's z velocity to 0
        this.entity.velocity.z = 0;

        return true;
      } else return false;
    } else {
      // Get the block in the direction the entity is moving
      const block = dimension.getBlock({
        x: Math.floor(position.x),
        y: Math.floor(position.y - hitboxHeight),
        z: Math.floor(position.z + velocity - hitboxWidth / 2)
      });

      // Check if the block in the direction the entity is moving is solid
      if (block.isSolid) {
        // Set the entity's z velocity to 0
        this.entity.velocity.z = 0;

        return true;
      } else return false;
    }
  }

  public applyGravityTick(): void {
    // Check if the entity is on the ground
    if (this.entity.onGround) return;

    // Apply gravity to the entity
    this.entity.velocity.y -= this.gravity;
  }
}

export { EntityPhysicsTrait };
