import { Endianness, type BinaryStream } from "@serenityjs/binarystream";
import { DataType } from "@serenityjs/raknet";

class Experiments extends DataType {
  public enabled: boolean;
  public name: string;

  public constructor(name: string, enabled: boolean) {
    super();
    this.name = name;
    this.enabled = enabled;
  }

  public static override read(stream: BinaryStream): Array<Experiments> {
    // Prepare an array to store the experiments.
    const packs: Array<Experiments> = [];

    // Read the number of experiments.
    const amount = stream.readInt32(Endianness.Little);

    // We then loop through the amount of experiments.
    // Reading the individual fields in the stream.
    for (let index = 0; index < amount; index++) {
      // Read all the fields for the pack.
      const name = stream.readVarString();
      const enabled = stream.readBool();

      // Push the pack to the array.
      packs.push(new Experiments(name, enabled));
    }

    // Return the packs.
    return packs;
  }

  public static override write(
    stream: BinaryStream,
    value: Array<Experiments>
  ): void {
    // Write the number of experiments given in the array.
    stream.writeInt32(value.length, Endianness.Little);

    // Loop through the experiments.
    for (const experiment of value) {
      // Write the fields for the experiment.
      stream.writeVarString(experiment.name);
      stream.writeBool(experiment.enabled);
    }
  }
}

export { Experiments };
