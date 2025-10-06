interface BlockRaycastOptions {
  /**
   * If true, liquid blocks will be considered as blocks that 'stop' the raycast.
   */
  includeLiquidBlocks?: boolean;

  /**
   * If true, passable blocks like vines and flowers will be considered as blocks that 'stop' the raycast.
   */
  includePassableBlocks?: boolean;

  /**
   * Maximum distance, in blocks, to process the raycast.
   */
  maxDistance?: number;
}

export { BlockRaycastOptions };
