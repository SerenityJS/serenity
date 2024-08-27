import { BinaryStream } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet";
import { InputDataFlags } from "../../enums/input-data-flags";

export class PlayerAuthInputData extends DataType {
  private flags: bigint;

  constructor(flags: bigint = BigInt(0)) {
    super();
    this.flags = flags;
  }

  public static write(stream: BinaryStream, value: PlayerAuthInputData): void {
    stream.writeVarLong(value.flags);
  }
 
  public static read(stream: BinaryStream): PlayerAuthInputData {
    const flags = stream.readVarLong();
    return new this(flags);
  }


  public setFlag(flag: InputDataFlags, value: boolean): void {
    const flagBit = BigInt(1) << BigInt(flag);
    if (value) {
      this.flags |= flagBit;
    } else {
      this.flags &= ~flagBit;
    }
  }

  public getFlag(flag: InputDataFlags): boolean {
    const flagBit = BigInt(1) << BigInt(flag);
    return (this.flags & flagBit) !== BigInt(0); 
  }

  public getAllFlags(): Record<keyof typeof InputDataFlags, boolean> {
    return Object.keys(InputDataFlags)
      .filter(key => isNaN(Number(key)))
      .reduce((accumulator, key) => {
        accumulator[key as keyof typeof InputDataFlags] = this.getFlag(InputDataFlags[key as keyof typeof InputDataFlags]);
        return accumulator;
      }, {} as Record<keyof typeof InputDataFlags, boolean>);
  }

  public getRawFlags(): bigint {
    return this.flags;
  }

  public setRawFlags(flags: bigint): void {
    this.flags = flags;
  }

  public static fromInputData(inputData: Record<string, boolean | bigint>): PlayerAuthInputData {
    const instance = new PlayerAuthInputData(inputData._value as bigint);
    
    for (const [key, value] of Object.entries(inputData)) {
      if (key !== '_value' && typeof value === 'boolean') {
        const flag = InputDataFlags[key as keyof typeof InputDataFlags];
        if (flag !== undefined) {
          instance.setFlag(flag, value);
        }
      }
    }

    return instance;
  }

  public toInputData(): Record<string, boolean | bigint> {
    const result: Record<string, boolean | bigint> = {
      _value: this.flags
    };

    for (const key of Object.keys(InputDataFlags).filter(key => isNaN(Number(key)))) {
      result[key] = this.getFlag(InputDataFlags[key as keyof typeof InputDataFlags]);
    }

    return result;
  }
}
