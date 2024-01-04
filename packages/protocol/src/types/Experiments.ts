import { Endianness, type BinaryStream } from '@serenityjs/binarystream';
import { DataType } from '@serenityjs/raknet-protocol';

interface Experiment {
	enabled: boolean;
	name: string;
}

class Experiments extends DataType {
	public static override read(stream: BinaryStream): Experiment[] {
		// Prepare an array to store the experiments.
		const packs: Experiment[] = [];

		// Read the number of experiments.
		const amount = stream.readInt32(Endianness.Little);

		// We then loop through the amount of experiments.
		// Reading the individual fields in the stream.
		for (let i = 0; i < amount; i++) {
			// Read all the fields for the pack.
			const name = stream.readVarString();
			const enabled = stream.readBool();

			// Push the pack to the array.
			packs.push({
				name,
				enabled,
			});
		}

		// Return the packs.
		return packs;
	}

	public static override write(stream: BinaryStream, value: Experiment[]): void {
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

export { Experiments, type Experiment };
