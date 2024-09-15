class PlayerDiagnostic {
	/**
	 * Whether the diagnostic is enabled client-side.
	 */
	public enabled = false;

	/**
	 * The client's frames per second.
	 */
	public fps = 0;

	/**
	 * The server simulation tick time.
	 */
	public serverSimTickTime = 0;

	/**
	 * The client simulation tick time.
	 */
	public clientSimTickTime = 0;

	/**
	 * The time the frame began.
	 */
	public beginFrameTime = 0;

	/**
	 * The time the input was received.
	 */
	public inputTime = 0;

	/**
	 * The time the frame was rendered
	 */
	public renderTime = 0;

	/**
	 * The time the frame ended.
	 */
	public endFrameTime = 0;

	/**
	 * The remainder time percentage.
	 */
	public remainderTimePercent = 0;

	/**
	 * The percentage of time that was unaccounted for in the frame.
	 */
	public unaccountedTimePercent = 0;
}

export { PlayerDiagnostic };
