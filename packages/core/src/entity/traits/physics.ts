import { EntityCollisionTrait } from "./collision";
import { EntityTrait } from "./trait";

class EntityPhysicsTrait extends EntityTrait {
  public static readonly identifier = "physics";
  public onTick(): void {
    // Check if the entity is alive
    if (!this.entity.isAlive) return;

    // Apply gravity to the entity
    if (this.entity.hasGravity())
      // Apply the gravity force to the entity
      this.entity.velocity.y += this.entity.getGravityForce();

    // Get the entity's collision trait
    const collision = this.entity.getTrait(EntityCollisionTrait);

    // Get the entity's position
    const position = this.entity.position;

    // Check if the entity has a collision trait
    if (collision) {
      // Check if the entity is colliding with a wall
      if (collision.xAxisCollision === -1 && this.entity.velocity.x < 0) {
        this.entity.velocity.x = 0;
      }
      // Check if the entity is colliding with a wall
      else if (collision.xAxisCollision === 1 && this.entity.velocity.x > 0) {
        this.entity.velocity.x = 0;
      }
      // If not, apply the x velocity to the entity
      else {
        position.x += this.entity.velocity.x;
        this.entity.velocity.x *= collision.frictionForce;
      }

      // Check if the entity is colling with the ground
      if (collision.yAxisCollision === -1 && this.entity.velocity.y < 0) {
        position.y = Math.round(position.y);

        // Reset the y velocity to the gravity force or zero
        this.entity.velocity.y = 0;
      }
      // Check if the entity is colliding with the ceiling
      else if (collision.yAxisCollision === 1 && this.entity.velocity.y > 0) {
        // Reset the y velocity to the gravity force or zero
        this.entity.velocity.y = this.entity.hasGravity()
          ? this.entity.getGravityForce()
          : 0;
      }
      // Apply the y velocity to the entity
      else position.y += this.entity.velocity.y;

      // Check if the entity is colliding with a wall
      if (collision.zAxisCollision === -1 && this.entity.velocity.z < 0) {
        this.entity.velocity.z = 0;
      }
      // Check if the entity is colliding with a wall
      else if (collision.zAxisCollision === 1 && this.entity.velocity.z > 0) {
        this.entity.velocity.z = 0;
      }
      // If not, apply the z velocity to the entity
      else {
        position.z += this.entity.velocity.z;
        this.entity.velocity.z *= collision.frictionForce;
      }
    } else {
      position.x += this.entity.velocity.x;
      position.y += this.entity.velocity.y;
      position.z += this.entity.velocity.z;
    }

    // Check if the entity's velocity is getting close to 0
    // If so, set the velocity to 0
    if (Math.abs(this.entity.velocity.x) < 0.001) this.entity.velocity.x = 0;
    if (Math.abs(this.entity.velocity.y) < 0.001) this.entity.velocity.y = 0;
    if (Math.abs(this.entity.velocity.z) < 0.001) this.entity.velocity.z = 0;

    // Check if the entity is moving
    if (this.entity.velocity.isZero()) this.entity.isMoving = false;
    else this.entity.isMoving = true;

    // Set the entity's position
    this.entity.position = position;
  }
}

export { EntityPhysicsTrait };
