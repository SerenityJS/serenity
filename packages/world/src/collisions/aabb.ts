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
		let vec1 = AABB.onLine(Axis.X, start, end, min.x);
		let vec2 = AABB.onLine(Axis.X, start, end, max.x);
		let vec3 = AABB.onLine(Axis.Y, start, end, min.y);
		let vec4 = AABB.onLine(Axis.Y, start, end, max.y);
		let vec5 = AABB.onLine(Axis.Z, start, end, min.z);
		let vec6 = AABB.onLine(Axis.Z, start, end, max.z);
		let distance = Number.MAX_VALUE;
		let hitPosition: Vector3f | undefined;
		const faceMap: Map<Vector3f | undefined, BlockFace> = new Map([
			[vec1, BlockFace.West],
			[vec2, BlockFace.East],
			[vec3, BlockFace.Bottom],
			[vec4, BlockFace.Top],
			[vec5, BlockFace.North],
			[vec6, BlockFace.South]
		]);

		// Check if intersection points are within the AABB
		if (vec1 && !aabb.withinAxis([Axis.Y, Axis.Z], vec1)) vec1 = undefined;
		if (vec2 && !aabb.withinAxis([Axis.Y, Axis.Z], vec2)) vec2 = undefined;
		if (vec3 && !aabb.withinAxis([Axis.X, Axis.Z], vec3)) vec3 = undefined;
		if (vec4 && !aabb.withinAxis([Axis.X, Axis.Z], vec4)) vec4 = undefined;
		if (vec5 && !aabb.withinAxis([Axis.X, Axis.Y], vec5)) vec5 = undefined;
		if (vec6 && !aabb.withinAxis([Axis.X, Axis.Y], vec6)) vec6 = undefined;

		// Find the closest valid intersection point
		for (const vec of faceMap.keys()) {
			if (!vec) continue;
			const vecDistance = start.subtract(vec).lengthSqrt();

			if (vecDistance > distance) continue;
			distance = vecDistance;
			hitPosition = vec;
		}

		// Return the hit result if an intersection was found
		if (!hitPosition) return;

		return {
			box: aabb,
			position: hitPosition,
			face: faceMap.get(hitPosition) ?? BlockFace.North
		};
	}
}

export { AABB };
