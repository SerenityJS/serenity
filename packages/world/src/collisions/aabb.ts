import { BlockFace, Vector3f } from "@serenityjs/protocol";

import { Axis, type HitResult } from "../types";

/**
 * Represents an Axis-Aligned Bounding Box (AABB) in 3D space.
 * An AABB is defined by its minimum and maximum corners.
 */
class AABB {
	public min: Vector3f; // Minimum corner of the AABB
	public max: Vector3f; // Maximum corner of the AABB

	/**
	 * Constructs an AABB with specified minimum and maximum corners.
	 *
	 * @param min - The minimum corner of the AABB (Vector3f).
	 * @param max - The maximum corner of the AABB (Vector3f).
	 */
	public constructor(min: Vector3f, max: Vector3f) {
		this.min = min;
		this.max = max;
	}

	/**
	 * Moves the AABB by a given position vector.
	 *
	 * @param position - The vector to move the AABB by (Vector3f).
	 * @return A new AABB moved by the position vector.
	 */
	public move(position: Vector3f): AABB {
		return new AABB(this.min.add(position), this.max.add(position));
	}

	/**
	 * Expands the AABB by a given vector. The expansion affects the min and max points
	 * depending on whether the expansion vector is positive or negative.
	 *
	 * @param position - The expansion vector (Vector3f).
	 * @return A new AABB expanded by the position vector.
	 */
	public expand(position: Vector3f): AABB {
		if (position.x < 0) this.min.x += position.x;
		if (position.y < 0) this.min.y += position.y;
		if (position.z < 0) this.min.z += position.z;
		if (position.x > 0) this.max.x += position.x;
		if (position.y > 0) this.max.y += position.y;
		if (position.z > 0) this.max.z += position.z;

		return new AABB(this.min, this.max);
	}

	/**
	 * Checks if a given point is inside the AABB.
	 *
	 * @param position - The point to check (Vector3f).
	 * @return True if the point is inside the AABB; otherwise, false.
	 */
	public contains(position: Vector3f): boolean {
		return (
			position.x >= this.min.x &&
			position.x <= this.max.x &&
			position.y >= this.min.y &&
			position.y <= this.max.y &&
			position.z >= this.min.z &&
			position.z <= this.max.z
		);
	}

	/**
	 * Determines if a given value intersects a line segment defined by two vectors
	 * along a specified axis, and returns the intersection point if it falls within
	 * the segment bounds.
	 *
	 * @param axis - The axis along which to check the intersection (Axis).
	 * @param vecA - The start of the line segment (Vector3f).
	 * @param vecB - The end of the line segment (Vector3f).
	 * @param value - The value to check for intersection.
	 * @return The intersection point as a Vector3f if it is valid; otherwise, undefined.
	 */
	public static onLine(
		axis: Axis,
		vecA: Vector3f,
		vecB: Vector3f,
		value: number
	): Vector3f | undefined {
		const float = (value - vecA[axis]) / (vecB[axis] - vecA[axis]);

		if (float < 0 || float > 1) return undefined; // Intersection point outside the line segment

		// Calculate and return the intersection point
		return new Vector3f(
			Axis.X === axis ? value : vecA.x + (vecB.x - vecA.x) * float,
			Axis.Y === axis ? value : vecA.y + (vecB.y - vecA.y) * float,
			Axis.Z === axis ? value : vecA.z + (vecB.z - vecA.z) * float
		);
	}

	/**
	 * Checks if a given vector is within the AABB bounds along specified axes.
	 *
	 * @param axis - An array of axes to check against (Array<Axis>).
	 * @param vec - The vector to check (Vector3f).
	 * @return True if the vector is within the bounds on the specified axes; otherwise, false.
	 */
	public withinAxis(axis: Array<Axis>, vec: Vector3f): boolean {
		const [axisA, axisB] = axis;

		if (!axisA || !axisB) return false;
		if (vec[axisB] < this.min[axisB] || vec[axisB] > this.max[axisB])
			return false;
		return vec[axisA] >= this.min[axisA] && vec[axisA] <= this.max[axisA];
	}

	public within(vec: Vector3f): boolean {
		if (vec.x < this.min.x || vec.x > this.max.x) return false;
		if (vec.y < this.min.y || vec.y > this.max.y) return false;
		return vec.x >= this.min.x && vec.x <= this.max.x;
	}

	public grow(x: number): AABB {
		const vectorized = new Vector3f(x, x, x);
		return new AABB(this.min.subtract(vectorized), this.max.add(vectorized));
	}

	public intersectsWith(box: AABB): boolean {
		const epsilon = 1e-7;

		if (box.max.x - this.min.x < epsilon || this.max.x - box.min.x < epsilon)
			return false;
		if (box.max.y - this.min.y < epsilon || this.max.y - box.min.y < epsilon)
			return false;

		return box.max.x - this.min.x > epsilon && this.max.x - box.min.x > epsilon;
	}

	/**
	 * Determines if a ray defined by a start and end vector intersects with the AABB.
	 * Returns the hit result with the intersection details.
	 *
	 * @param aabb - The AABB to check for intersection (AABB).
	 * @param start - The start point of the ray (Vector3f).
	 * @param end - The end point of the ray (Vector3f).
	 * @return A HitResult if an intersection is found; otherwise, undefined.
	 */
	public static Intercept(
		aabb: AABB,
		start: Vector3f,
		end: Vector3f
	): HitResult | undefined {
		const { min, max } = aabb;
		const faces = [
			{ axis: Axis.X, value: min.x, face: BlockFace.West },
			{ axis: Axis.X, value: max.x, face: BlockFace.East },
			{ axis: Axis.Y, value: min.y, face: BlockFace.Bottom },
			{ axis: Axis.Y, value: max.y, face: BlockFace.Top },
			{ axis: Axis.Z, value: min.z, face: BlockFace.North },
			{ axis: Axis.Z, value: max.z, face: BlockFace.South }
		];

		let hitPosition: Vector3f | undefined;
		let minDistance = Number.MAX_VALUE;
		let hitFace: BlockFace = BlockFace.North;

		for (const { axis, value, face } of faces) {
			const vec = AABB.onLine(axis, start, end, value);
			if (
				vec &&
				aabb.withinAxis(
					axis === Axis.X
						? [Axis.Y, Axis.Z]
						: axis === Axis.Y
							? [Axis.X, Axis.Z]
							: [Axis.X, Axis.Y],
					vec
				)
			) {
				const distance = start.subtract(vec).lengthSqrt();
				if (distance < minDistance) {
					minDistance = distance;
					hitPosition = vec;
					hitFace = face;
				}
			}
		}

		return hitPosition
			? {
					box: aabb,
					position: hitPosition,
					face: hitFace,
					distance: minDistance
				}
			: undefined;
	}
}

export { AABB };
