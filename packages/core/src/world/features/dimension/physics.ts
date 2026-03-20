import {
  Entity,
  EntityCollisionTrait,
  EntityGravityTrait
} from "../../../entity";

import { DimensionFeature } from "./feature";

/**
 * The axis currently being resolved for movement/collision.
 */
type Axis = "x" | "y" | "z";

/**
 * Simple axis-aligned bounding box used for entity collision checks.
 */
interface AABB {
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
}

/**
 * Handles simple entity gravity + block collision physics.
 *
 * Current behavior:
 * - Only simulates non-player entities
 * - Only simulates entities that have BOTH gravity and collision traits
 * - Uses bottom-center entity positioning
 * - Resolves motion one axis at a time (Y, then X, then Z)
 * - Uses full solid block collision based on permutation.type.solid
 * - Applies entity friction plus block ground friction when grounded
 * - Applies air drag while airborne for a more vanilla-like feel
 *
 * Notes:
 * - This is tick-based physics, not time-in-seconds physics
 * - Velocity values are assumed to already be tuned for per-tick updates
 * - `entity.isMoving` is based on actual displacement this tick so the
 *   movement system can still broadcast the final landing correction
 */
class PhysicsFeature extends DimensionFeature {
  /**
   * Unique identifier used by the dimension feature registry.
   */
  public static readonly identifier = "physics";

  /**
   * Small offset used to avoid precision issues when comparing entity bounds
   * against block boundaries.
   */
  private static readonly EPSILON = 1e-4;

  /**
   * Threshold below which velocity is treated as zero.
   */
  private static readonly STOP_EPSILON = 1e-3;

  /**
   * Per-tick drag applied to entities while they are in air.
   *
   * This is a simple vanilla-like approximation so dropped/thrown entities
   * do not travel unrealistically far.
   */
  private static readonly AIR_DRAG = 0.98;

  /**
   * Scratch AABB reused every tick to avoid allocations in the hot path.
   */
  private readonly entityAabb: AABB = {
    minX: 0,
    minY: 0,
    minZ: 0,
    maxX: 0,
    maxY: 0,
    maxZ: 0
  };

  /**
   * Called once per dimension tick.
   * Iterates every entity in the dimension and applies physics where relevant.
   */
  public onTick(): void {
    const entities = this.dimension.getEntities();

    for (const entity of entities) {
      this.tickEntity(entity);
    }
  }

  /**
   * Simulates one entity for one tick.
   *
   * This method:
   * - validates whether the entity should be simulated
   * - applies gravity
   * - resolves vertical and horizontal movement against solid blocks
   * - applies horizontal friction or air drag
   * - applies vertical air drag when airborne
   * - updates movement/falling flags
   * - writes the final position back to the entity
   */
  private tickEntity(entity: Entity): void {
    // Skip entities that should not be simulated.
    if (!entity.isAlive) return;
    if (!entity.isTicking) return;
    if (entity.isPlayer()) return;

    // Gravity is only applied if the entity has both gravity and collision.
    const gravity = entity.getTrait(EntityGravityTrait);
    const collision = entity.getTrait(EntityCollisionTrait);

    if (!gravity || !collision) return;

    // Read the existing velocity and position objects once.
    const velocity = entity.velocity;
    const position = entity.position;

    /**
     * Use the grounded state from the START of the tick to determine whether
     * block friction should apply this frame.
     */
    const wasOnGround = entity.onGround;

    /**
     * Ground friction comes from the supporting block(s) under the entity.
     * If the entity was not grounded at the start of the tick, use air drag.
     */
    const groundFriction = wasOnGround
      ? this.getGroundFriction(entity, collision.width)
      : 1;

    /**
     * Final horizontal damping for this tick.
     *
     * - On ground: entity friction * block friction
     * - In air: air drag
     */
    const horizontalDamping = wasOnGround
      ? collision.frictionForce * groundFriction
      : PhysicsFeature.AIR_DRAG;

    /**
     * Resting fast-path:
     * If the entity is on the ground and almost fully stopped, do not simulate
     * the full physics step unless it has lost support beneath it.
     *
     * This keeps idle entities cheap while still allowing them to start falling
     * if the block below is removed.
     */
    if (
      entity.onGround &&
      Math.abs(velocity.x) < PhysicsFeature.STOP_EPSILON &&
      Math.abs(velocity.y) < PhysicsFeature.STOP_EPSILON &&
      Math.abs(velocity.z) < PhysicsFeature.STOP_EPSILON
    ) {
      if (this.hasGroundSupport(entity, collision.width)) {
        velocity.x = 0;
        velocity.y = 0;
        velocity.z = 0;
        entity.isMoving = false;
        entity.isFalling = false;
        return;
      }

      // The entity no longer has support below it, so wake it up.
      entity.onGround = false;
    }

    /**
     * Apply gravity.
     *
     * This engine uses tick-based physics, so gravity.force is assumed to
     * already be a per-tick value.
     */
    velocity.y += gravity.force;

    // Desired movement for this tick on each axis.
    const desiredX = velocity.x;
    const desiredY = velocity.y;
    const desiredZ = velocity.z;

    // Actual movement after collision resolution.
    let movedX = 0;
    let movedY = 0;
    let movedZ = 0;

    // Reset grounded state before resolving vertical movement.
    entity.onGround = false;

    /**
     * Resolve Y first.
     *
     * Doing vertical movement first usually gives more stable landing behavior,
     * because the entity can establish whether it is on the ground before
     * horizontal motion is processed.
     */
    if (desiredY !== 0) {
      movedY = this.resolveAxis(
        entity,
        "y",
        desiredY,
        collision.width,
        collision.height
      );

      // If movement was clamped, the entity hit either the ground or a ceiling.
      if (movedY !== desiredY) {
        // Only set onGround when downward movement was blocked.
        if (desiredY < 0) entity.onGround = true;

        // Vertical velocity stops on collision.
        velocity.y = 0;
      } else if (!wasOnGround) {
        /**
         * Apply vertical air drag only when airborne and not blocked vertically.
         * This helps create a terminal-velocity-like effect and makes thrown
         * items feel closer to vanilla.
         */
        velocity.y *= PhysicsFeature.AIR_DRAG;
      }
    }

    // Apply final vertical displacement.
    if (movedY !== 0) position.y += movedY;

    /**
     * Resolve X movement.
     *
     * If blocked, zero horizontal velocity on that axis.
     * If not blocked, apply ground friction or air drag after movement.
     */
    if (desiredX !== 0) {
      movedX = this.resolveAxis(
        entity,
        "x",
        desiredX,
        collision.width,
        collision.height
      );

      if (movedX !== desiredX) velocity.x = 0;
      else velocity.x *= horizontalDamping;
    }

    // Apply final X displacement.
    if (movedX !== 0) position.x += movedX;

    /**
     * Resolve Z movement.
     *
     * Same behavior as X: zero out blocked motion, otherwise apply damping.
     */
    if (desiredZ !== 0) {
      movedZ = this.resolveAxis(
        entity,
        "z",
        desiredZ,
        collision.width,
        collision.height
      );

      if (movedZ !== desiredZ) velocity.z = 0;
      else velocity.z *= horizontalDamping;
    }

    // Apply final Z displacement.
    if (movedZ !== 0) position.z += movedZ;

    /**
     * Snap very tiny velocities to zero so entities do not drift forever
     * because of floating-point leftovers.
     */
    if (Math.abs(velocity.x) < PhysicsFeature.STOP_EPSILON) velocity.x = 0;
    if (Math.abs(velocity.y) < PhysicsFeature.STOP_EPSILON) velocity.y = 0;
    if (Math.abs(velocity.z) < PhysicsFeature.STOP_EPSILON) velocity.z = 0;

    /**
     * Determine whether the entity moved enough this tick to count as moving.
     *
     * This is intentionally based on ACTUAL displacement rather than just final
     * velocity so that the last landing/collision correction still gets
     * broadcast by the movement system.
     */
    const movedThisTick =
      Math.abs(movedX) > PhysicsFeature.EPSILON ||
      Math.abs(movedY) > PhysicsFeature.EPSILON ||
      Math.abs(movedZ) > PhysicsFeature.EPSILON;

    /**
     * If the entity was moving downward and became grounded this tick, treat
     * that state change as movement too so the final landing position can sync.
     */
    const stateChanged = desiredY < 0 && entity.onGround;

    entity.isMoving = movedThisTick || stateChanged;
    entity.isFalling = !entity.onGround && velocity.y < 0;

    /**
     * Write the updated position back to the entity.
     *
     * Even though `position` is already a mutable object, the old engine
     * behavior relied on writing it back through the setter, so we preserve
     * that pattern here.
     */
    entity.position = position;
  }

  /**
   * Resolves movement along a single axis by sweeping the entity AABB through
   * the world and clamping the motion against nearby solid blocks.
   *
   * @param entity The entity being simulated
   * @param axis The axis currently being resolved
   * @param delta The intended movement on the axis
   * @param width Collision box width
   * @param height Collision box height
   * @returns The final allowed movement on that axis
   */
  private resolveAxis(
    entity: Entity,
    axis: Axis,
    delta: number,
    width: number,
    height: number
  ): number {
    const position = entity.position;

    // Build the entity AABB from its current bottom-center position.
    this.fillEntityAABB(
      this.entityAabb,
      position.x,
      position.y,
      position.z,
      width,
      height
    );

    // Start by assuming all requested movement is allowed.
    let resolved = delta;

    /**
     * Compute the swept bounds for the moving axis.
     *
     * These bounds define the region of blocks that might affect this move.
     * Only blocks inside this range need to be checked.
     */
    const sweptMinX =
      axis === "x"
        ? delta < 0
          ? this.entityAabb.minX + delta
          : this.entityAabb.minX
        : this.entityAabb.minX;

    const sweptMaxX =
      axis === "x"
        ? delta > 0
          ? this.entityAabb.maxX + delta
          : this.entityAabb.maxX
        : this.entityAabb.maxX;

    const sweptMinY =
      axis === "y"
        ? delta < 0
          ? this.entityAabb.minY + delta
          : this.entityAabb.minY
        : this.entityAabb.minY;

    const sweptMaxY =
      axis === "y"
        ? delta > 0
          ? this.entityAabb.maxY + delta
          : this.entityAabb.maxY
        : this.entityAabb.maxY;

    const sweptMinZ =
      axis === "z"
        ? delta < 0
          ? this.entityAabb.minZ + delta
          : this.entityAabb.minZ
        : this.entityAabb.minZ;

    const sweptMaxZ =
      axis === "z"
        ? delta > 0
          ? this.entityAabb.maxZ + delta
          : this.entityAabb.maxZ
        : this.entityAabb.maxZ;

    // Convert the swept bounds into candidate block coordinates.
    const minBX = Math.floor(sweptMinX + PhysicsFeature.EPSILON);
    const maxBX = Math.floor(sweptMaxX - PhysicsFeature.EPSILON);
    const minBY = Math.floor(sweptMinY + PhysicsFeature.EPSILON);
    const maxBY = Math.floor(sweptMaxY - PhysicsFeature.EPSILON);
    const minBZ = Math.floor(sweptMinZ + PhysicsFeature.EPSILON);
    const maxBZ = Math.floor(sweptMaxZ - PhysicsFeature.EPSILON);

    /**
     * Check every potentially colliding solid block in the swept range.
     * For each block, clamp movement to the nearest blocking face.
     */
    for (let bx = minBX; bx <= maxBX; bx++) {
      for (let by = minBY; by <= maxBY; by++) {
        for (let bz = minBZ; bz <= maxBZ; bz++) {
          if (!this.isSolidBlock(bx, by, bz)) continue;
          if (!this.intersectsOtherAxes(axis, bx, by, bz)) continue;

          if (axis === "x") {
            if (delta > 0) {
              // Moving positive X: clamp against the left face of the block.
              const allowed =
                bx - this.entityAabb.maxX - PhysicsFeature.EPSILON;
              if (allowed < resolved) resolved = allowed;
            } else {
              // Moving negative X: clamp against the right face of the block.
              const allowed =
                bx + 1 - this.entityAabb.minX + PhysicsFeature.EPSILON;
              if (allowed > resolved) resolved = allowed;
            }
          } else if (axis === "y") {
            if (delta > 0) {
              // Moving upward: clamp against the bottom face of the block.
              const allowed =
                by - this.entityAabb.maxY - PhysicsFeature.EPSILON;
              if (allowed < resolved) resolved = allowed;
            } else {
              // Moving downward: clamp against the top face of the block.
              const allowed =
                by + 1 - this.entityAabb.minY + PhysicsFeature.EPSILON;
              if (allowed > resolved) resolved = allowed;
            }
          } else {
            if (delta > 0) {
              // Moving positive Z: clamp against the near face of the block.
              const allowed =
                bz - this.entityAabb.maxZ - PhysicsFeature.EPSILON;
              if (allowed < resolved) resolved = allowed;
            } else {
              // Moving negative Z: clamp against the far face of the block.
              const allowed =
                bz + 1 - this.entityAabb.minZ + PhysicsFeature.EPSILON;
              if (allowed > resolved) resolved = allowed;
            }
          }
        }
      }
    }

    return resolved;
  }

  /**
   * Returns whether the block at the given world position is considered solid
   * for collision.
   */
  private isSolidBlock(x: number, y: number, z: number): boolean {
    const permutation = this.dimension.getPermutation({ x, y, z });
    return permutation.type.solid;
  }

  /**
   * Checks whether the entity AABB overlaps the candidate block on the two
   * non-moving axes for the current axis resolution.
   *
   * This avoids performing unnecessary face clamps against blocks that are not
   * actually aligned with the entity on the other axes.
   */
  private intersectsOtherAxes(
    axis: Axis,
    bx: number,
    by: number,
    bz: number
  ): boolean {
    const aabb = this.entityAabb;

    if (axis === "x") {
      return (
        aabb.maxY > by + PhysicsFeature.EPSILON &&
        aabb.minY < by + 1 - PhysicsFeature.EPSILON &&
        aabb.maxZ > bz + PhysicsFeature.EPSILON &&
        aabb.minZ < bz + 1 - PhysicsFeature.EPSILON
      );
    }

    if (axis === "y") {
      return (
        aabb.maxX > bx + PhysicsFeature.EPSILON &&
        aabb.minX < bx + 1 - PhysicsFeature.EPSILON &&
        aabb.maxZ > bz + PhysicsFeature.EPSILON &&
        aabb.minZ < bz + 1 - PhysicsFeature.EPSILON
      );
    }

    return (
      aabb.maxX > bx + PhysicsFeature.EPSILON &&
      aabb.minX < bx + 1 - PhysicsFeature.EPSILON &&
      aabb.maxY > by + PhysicsFeature.EPSILON &&
      aabb.minY < by + 1 - PhysicsFeature.EPSILON
    );
  }

  /**
   * Fills an AABB using the entity's bottom-center position and collision size.
   */
  private fillEntityAABB(
    out: AABB,
    x: number,
    y: number,
    z: number,
    width: number,
    height: number
  ): void {
    const halfWidth = width / 2;

    out.minX = x - halfWidth;
    out.maxX = x + halfWidth;
    out.minY = y;
    out.maxY = y + height;
    out.minZ = z - halfWidth;
    out.maxZ = z + halfWidth;
  }

  /**
   * Checks whether the entity still has solid support directly below its
   * footprint.
   *
   * This is used by the sleeping fast-path so resting entities can remain
   * inactive unless the supporting block is removed.
   */
  private hasGroundSupport(entity: Entity, width: number): boolean {
    const position = entity.position;
    const halfWidth = width / 2;

    // Look one block below the entity's feet.
    const y = Math.floor(position.y - PhysicsFeature.EPSILON) - 1;

    const minX = Math.floor(position.x - halfWidth + PhysicsFeature.EPSILON);
    const maxX = Math.floor(position.x + halfWidth - PhysicsFeature.EPSILON);
    const minZ = Math.floor(position.z - halfWidth + PhysicsFeature.EPSILON);
    const maxZ = Math.floor(position.z + halfWidth - PhysicsFeature.EPSILON);

    for (let x = minX; x <= maxX; x++) {
      for (let z = minZ; z <= maxZ; z++) {
        if (this.isSolidBlock(x, y, z)) return true;
      }
    }

    return false;
  }

  /**
   * Returns the ground friction value from the solid support blocks directly
   * under the entity's footprint.
   *
   * If multiple support blocks are under the entity, the lowest friction is
   * used so the strongest slowing effect is applied consistently.
   */
  private getGroundFriction(entity: Entity, width: number): number {
    const position = entity.position;
    const halfWidth = width / 2;

    // Look one block below the entity's feet.
    const y = Math.floor(position.y - PhysicsFeature.EPSILON) - 1;

    const minX = Math.floor(position.x - halfWidth + PhysicsFeature.EPSILON);
    const maxX = Math.floor(position.x + halfWidth - PhysicsFeature.EPSILON);
    const minZ = Math.floor(position.z - halfWidth + PhysicsFeature.EPSILON);
    const maxZ = Math.floor(position.z + halfWidth - PhysicsFeature.EPSILON);

    // Default neutral friction when no valid solid support block is found.
    let friction = 1;

    for (let x = minX; x <= maxX; x++) {
      for (let z = minZ; z <= maxZ; z++) {
        const permutation = this.dimension.getPermutation({ x, y, z });

        // Only use friction from solid support blocks.
        if (!permutation.type.solid) continue;

        // Use the lowest friction value beneath the footprint.
        friction = Math.min(friction, permutation.components.getFriction());
      }
    }

    return friction;
  }
}

export { PhysicsFeature };
