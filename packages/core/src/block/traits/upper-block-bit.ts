import { BlockTrait } from "./trait";

class BlockUpperBitTrait extends BlockTrait {
  public static readonly identifier = "upper_block_bit";

  public onPlace(): void {
    // Get the above block
    const above = this.block.above();

    const state = this.block.permutation.state;

    const newState = {
      ...state,
      upper_block_bit: true
    };

    const permutation = this.block.type.getPermutation(newState);

    above.setPermutation(permutation);
  }
}

export { BlockUpperBitTrait };
