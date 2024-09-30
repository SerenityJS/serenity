class PathType {
	public static readonly Walkable = new PathType(0);
	public static readonly Open = new PathType(0);
	public static readonly Blocked = new PathType(-1);
	public static readonly DamageFire = new PathType(16);
	public static readonly DangerFire = new PathType(8);
	public static readonly OpenDoor = new PathType(0);
	public static readonly Liquid = new PathType(8);
	public static readonly Lava = new PathType(-1);

	public cost: number = 0;

	public constructor(cost: number) {
		this.cost = cost;
	}
}

export { PathType };
