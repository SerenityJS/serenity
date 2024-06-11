/**
 * A fast javascript implementation of simplex noise based on sources
 * of Jonas Wagner. https://github.com/jwagner/simplex-noise.js. Added
 * octaves, amplitude, scale and distribution parameters. Good explanation
 * of these parameters may be found here: https://www.redblobgames.com/maps/terrain-from-noise.
 * Only 3D version + time are implemented. By default all configs === 1
 *
 * Config:
 *   scale     [0..1] - zoom coefficient. 0 - max zoom, 1 - min zoom
 *   amplitude [0..1] - means: take all possible height values (1) or only part of it (< 1)
 *   distrib   [0..X] - 0..1 - get values from top, 1..X get values from buttom
 *   octaves   [1..X] - amount of details of a 3D map
 *   random           - reference to random function, which return values between 0..1
 *
 * Example:
 *   let simplex = new Simplex();
 *   let t = 0;
 *
 *   function drawNoise(width, height) {
 *     for (let x = 0; x < width; x++) {
 *       for (let y = 0; y < height; y++) {
 *         z = simplex.noise(x, y, t);
 *         // draw x,y,z point
 *       }
 *     }
 *     t += .001;
 *   }
 *   ...
 *   drawNoise(128, 128);
 *
 * @author flatline
 */

const F3 = 1 / 3;
const G3 = 1 / 6;

/**
 * Creates simplex noise class instance with options
 */
export class Simplex {
	public amplitude: number;
	public distrib: number;
	public scale: number;
	public octaves: number;
	public seed: number;
	public grad3: Float32Array;
	public grad4: Float32Array;
	public p: Uint8Array;
	public perm: Uint8Array;
	public permMod12: Uint8Array;

	public constructor(cfg: {
		amplitude: number;
		distrib: number;
		scale: number;
		octaves: number;
		seed: number;
	}) {
		cfg = cfg || {};

		this.amplitude = cfg.amplitude || 1;
		this.distrib = cfg.distrib || 1;
		this.scale = cfg.scale || 1;
		this.octaves = cfg.octaves || 1;
		this.seed = cfg.seed || 69;

		this.grad3 = new Float32Array([
			1, 1, 0, -1, 1, 0, 1, -1, 0,

			-1, -1, 0, 1, 0, 1, -1, 0, 1,

			1, 0, -1, -1, 0, -1, 0, 1, 1,

			0, -1, 1, 0, 1, -1, 0, -1, -1
		]);
		this.grad4 = new Float32Array([
			0, 1, 1, 1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1, -1, 0, -1, 1, 1, 0, -1, 1,
			-1, 0, -1, -1, 1, 0, -1, -1, -1, 1, 0, 1, 1, 1, 0, 1, -1, 1, 0, -1, 1, 1,
			0, -1, -1, -1, 0, 1, 1, -1, 0, 1, -1, -1, 0, -1, 1, -1, 0, -1, -1, 1, 1,
			0, 1, 1, 1, 0, -1, 1, -1, 0, 1, 1, -1, 0, -1, -1, 1, 0, 1, -1, 1, 0, -1,
			-1, -1, 0, 1, -1, -1, 0, -1, 1, 1, 1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1,
			-1, 0, -1, 1, 1, 0, -1, 1, -1, 0, -1, -1, 1, 0, -1, -1, -1, 0
		]);

		this.p = this._buildPermutationTable();
		this.perm = new Uint8Array(512);
		this.permMod12 = new Uint8Array(512);

		for (let index = 0; index < 512; index++) {
			this.perm[index] = this.p[index & 255] ?? 0;
			this.permMod12[index] = (this.perm[index] ?? 0) % 12;
		}
	}

	/**
	 * Does simplex noise. Returns height by (x,y) and time (t)
	 * @param {Number} x X
	 * @param {Number} y Y
	 * @param {Number} z Z
	 */
	public noise(x: number, y: number, z: number = 0) {
		let noise = 0;
		let a = this.amplitude;
		let s = this.scale;

		for (let index = 0; index < this.octaves; index++) {
			noise += this.rawNoise(x * s, y * s, z * s) * a;
			a *= 0.5;
			s *= 2;
		}

		if (noise > 1) noise = 1;
		if (noise < -1) noise = -1;

		return Math.pow(noise, this.distrib);
	}

	public rawNoise(xin: number, yin: number, tin: number) {
		const permModule12 = this.permMod12;
		const perm = this.perm;
		const grad3 = this.grad3;
		let n0, n1, n2, n3; // Noise contributions from the four corners
		// Skew the input space to determine which simplex cell we're in
		const s = (xin + yin + tin) * F3; // Very nice and simple skew factor for 3D
		const index = Math.floor(xin + s);
		const index_ = Math.floor(yin + s);
		const k = Math.floor(tin + s);
		const t = (index + index_ + k) * G3;
		const X0 = index - t; // Unskew the cell origin back to (x,y,z) space
		const Y0 = index_ - t;
		const Z0 = k - t;
		const x0 = xin - X0; // The x,y,z distances from the cell origin
		const y0 = yin - Y0;
		const z0 = tin - Z0;
		// For the 3D case, the simplex shape is a slightly irregular tetrahedron.
		// Determine which simplex we are in.
		let index1, index1_, k1; // Offsets for second corner of simplex in (i,j,k) coords
		let index2, index2_, k2; // Offsets for third corner of simplex in (i,j,k) coords
		if (x0 >= y0) {
			if (y0 >= z0) {
				index1 = 1;
				index1_ = 0;
				k1 = 0;
				index2 = 1;
				index2_ = 1;
				k2 = 0;
			} // X Y Z order
			else if (x0 >= z0) {
				index1 = 1;
				index1_ = 0;
				k1 = 0;
				index2 = 1;
				index2_ = 0;
				k2 = 1;
			} // X Z Y order
			else {
				index1 = 0;
				index1_ = 0;
				k1 = 1;
				index2 = 1;
				index2_ = 0;
				k2 = 1;
			} // Z X Y order
		} else {
			// x0<y0
			if (y0 < z0) {
				index1 = 0;
				index1_ = 0;
				k1 = 1;
				index2 = 0;
				index2_ = 1;
				k2 = 1;
			} // Z Y X order
			else if (x0 < z0) {
				index1 = 0;
				index1_ = 1;
				k1 = 0;
				index2 = 0;
				index2_ = 1;
				k2 = 1;
			} // Y Z X order
			else {
				index1 = 0;
				index1_ = 1;
				k1 = 0;
				index2 = 1;
				index2_ = 1;
				k2 = 0;
			} // Y X Z order
		}
		// A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
		// a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
		// a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
		// c = 1/6.
		const x1 = x0 - index1 + G3; // Offsets for second corner in (x,y,z) coords
		const y1 = y0 - index1_ + G3;
		const z1 = z0 - k1 + G3;
		const x2 = x0 - index2 + 2 * G3; // Offsets for third corner in (x,y,z) coords
		const y2 = y0 - index2_ + 2 * G3;
		const z2 = z0 - k2 + 2 * G3;
		const x3 = x0 - 1 + 3 * G3; // Offsets for last corner in (x,y,z) coords
		const y3 = y0 - 1 + 3 * G3;
		const z3 = z0 - 1 + 3 * G3;
		// Work out the hashed gradient indices of the four simplex corners
		const ii = index & 255;
		const jj = index_ & 255;
		const kk = k & 255;
		// Calculate the contribution from the four corners
		let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
		if (t0 < 0) n0 = 0;
		else {
			const gi0 =
				(permModule12[ii + (perm[jj + (perm[kk] ?? 0)] ?? 0)] ?? 0) * 3;
			t0 *= t0;
			n0 =
				t0 *
				t0 *
				((grad3[gi0] ?? 0) * x0 +
					(grad3[gi0 + 1] ?? 0) * y0 +
					(grad3[gi0 + 2] ?? 0) * z0);
		}
		let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
		if (t1 < 0) n1 = 0;
		else {
			const gi1 =
				(permModule12[
					ii + index1 + (perm[jj + index1_ + (perm[kk + k1] ?? 0)] ?? 0)
				] ?? 0) * 3;
			t1 *= t1;
			n1 =
				t1 *
				t1 *
				((grad3[gi1] ?? 0) * x1 +
					(grad3[gi1 + 1] ?? 0) * y1 +
					(grad3[gi1 + 2] ?? 0) * z1);
		}
		let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
		if (t2 < 0) n2 = 0;
		else {
			const gi2 =
				(permModule12[
					ii + index2 + (perm[jj + index2_ + (perm[kk + k2] ?? 0)] ?? 0)
				] ?? 0) * 3;
			t2 *= t2;
			n2 =
				t2 *
				t2 *
				((grad3[gi2] ?? 0) * x2 +
					(grad3[gi2 + 1] ?? 0) * y2 +
					(grad3[gi2 + 2] ?? 0) * z2);
		}
		let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
		if (t3 < 0) n3 = 0;
		else {
			const gi3 =
				(permModule12[ii + 1 + (perm[jj + 1 + (perm[kk + 1] ?? 0)] ?? 0)] ??
					0) * 3;
			t3 *= t3;
			n3 =
				t3 *
				t3 *
				((grad3[gi3] ?? 0) * x3 +
					(grad3[gi3 + 1] ?? 0) * y3 +
					(grad3[gi3 + 2] ?? 0) * z3);
		}
		// Add contributions from each corner to get the final noise value.
		// The result is scaled to stay just inside [-1,1]
		return 32 * (n0 + n1 + n2 + n3);
	}

	/**
	 * Initialization method
	 * @param {Function} random function reference
	 */
	public _buildPermutationTable() {
		const p = new Uint8Array(256);
		for (let index = 0; index < 256; index++) {
			p[index] = index;
		}
		for (let index = 0; index < 255; index++) {
			const r = index + Math.trunc(this.sudoRandom() * (256 - index));
			const aux = p[index] ?? 0;
			p[index] = p[r] ?? 0;
			p[r] = aux;
		}
		return p;
	}

	public static currentSeed: number;
	public sudoRandom(): number {
		const a = 1_664_525;
		const c = 1_013_904_223;
		const m = Math.pow(2, 32);

		Simplex.currentSeed = (a * Simplex.currentSeed + c) % m;

		return Simplex.currentSeed / m;
	}
}