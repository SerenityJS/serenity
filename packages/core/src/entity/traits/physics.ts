import { EntityGravityTrait } from "./gravity";
import { EntityTrait } from "./trait";

class EntityPhysicsTrait extends EntityTrait {
  public static readonly identifier = "physics";

  public gravity = 0.05;

  public onTick(): void {
    // North = -z, South = +z, East = +x, West = -x

    // Check if the entity is alive
    if (this.entity.isAlive === false) return;

    const hasGravity = this.entity.hasTrait(EntityGravityTrait);

    const dimension = this.entity.dimension;

    const velocity = this.entity.velocity;
    const position = this.entity.position;

    const hitboxWidth = 0.15;
    const hitboxHeight = 0.15;

    // Check if the entity is moving
    if (velocity.isZero()) this.entity.isMoving = false;
    else this.entity.isMoving = true;

    if (velocity.y !== 0) {
      const negate = velocity.y < 0 ? -1 : 1;

      // Get the block in the direction the entity is moving
      const bx = Math.floor(position.x - hitboxWidth);
      const by = Math.floor(position.y + velocity.y + hitboxHeight * negate);
      const bz = Math.floor(position.z - hitboxWidth);
      const block = dimension.getBlock({ x: bx, y: by, z: bz });

      // Check if the block is solid or if the velocity is approaching 0
      if (block.isSolid || Math.abs(velocity.y) < 0.01) {
        this.entity.velocity.y = 0;
      } else {
        // Get the friction of the block below the entity
        const below = dimension.getBlock({ x: bx, y: by - 1, z: bz });

        // Apply gravity to the entity
        this.entity.velocity.y *= hasGravity
          ? 1 - this.gravity
          : below.type.friction;

        // Update the entity's position
        this.entity.position.y += velocity.y;
      }
    }

    // Check if the entity is moving north
    if (velocity.z !== 0) {
      const negate = velocity.z < 0 ? -1 : 1;

      // Get the block in the direction the entity is moving
      const bx = Math.floor(position.x + hitboxWidth);
      const by = Math.floor(position.y + hitboxHeight);
      const bz = Math.floor(position.z + velocity.z + hitboxWidth * negate);
      const block = dimension.getBlock({ x: bx, y: by, z: bz });

      // Check if the block is solid or if the velocity is approaching 0
      if (block.isSolid) {
        // Set the entity's velocity to 0
        this.entity.velocity.z = 0;

        // Slightly push the entity in the opposite direction
        this.entity.velocity.z += 0.16 * -negate;
      } else if (Math.abs(velocity.z) < 0.01) {
        // Set the entity's velocity to 0
        this.entity.velocity.z = 0;
      } else {
        // Get the friction of the block below the entity
        const below = dimension.getBlock({
          x: Math.floor(position.x),
          y: Math.floor(position.y + hitboxHeight),
          z: Math.floor(position.z)
        });

        // Get the friction of the block below the entity
        const friction = below.type.friction;

        // Apply gravity to the entity
        this.entity.velocity.z *= friction;

        // Update the entity's position
        this.entity.position.z += velocity.z;
      }
    }

    // Check if the entity is moving east
    if (velocity.x !== 0) {
      const negate = velocity.x < 0 ? -1 : 1;

      // Get the block in the direction the entity is moving
      const bx = Math.floor(position.x + velocity.x + hitboxWidth * negate);
      const by = Math.floor(position.y + hitboxHeight);
      const bz = Math.floor(position.z + hitboxWidth);
      const block = dimension.getBlock({ x: bx, y: by, z: bz });

      // Check if the block is solid or if the velocity is approaching 0
      if (block.isSolid) {
        // Set the entity's velocity to 0
        this.entity.velocity.x = 0;

        // Slighly push the entity in the opposite direction
        this.entity.velocity.x += 0.16 * -negate;
      } else if (Math.abs(velocity.x) < 0.01) {
        // Set the entity's velocity to 0
        this.entity.velocity.x = 0;
      } else {
        // Get the friction of the block below the entity
        const below = dimension.getBlock({
          x: Math.floor(position.x),
          y: Math.floor(position.y + hitboxHeight),
          z: Math.floor(position.z)
        });

        // Get the friction of the block below the entity
        const friction = below.type.friction;

        // Apply gravity to the entity
        this.entity.velocity.x *= friction;

        // Update the entity's position
        this.entity.position.x += velocity.x;
      }
    }

    if (hasGravity) {
      // Get the block below the entity
      const below = dimension.getBlock({
        x: Math.floor(position.x),
        y: Math.round(position.y + hitboxHeight - 1),
        z: Math.floor(position.z)
      });

      // Check if the block below the entity is solid
      if (below.isSolid) {
        // Apply gravity to the entity
        this.entity.velocity.y = 0;

        // Apply friction to the entity
        if (this.entity.velocity.z !== 0)
          this.entity.velocity.z *= below.type.friction;

        // Apply friction to the entity
        if (this.entity.velocity.x !== 0)
          this.entity.velocity.x *= below.type.friction;

        // Set the entity to on ground
        this.entity.onGround = true;
      } else {
        // Apply gravity to the entity
        this.entity.velocity.y -= this.gravity;

        // Set the entity to not on ground
        this.entity.onGround = false;
      }
    }
  }
}

export { EntityPhysicsTrait };
