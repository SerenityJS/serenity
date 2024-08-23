import { DataType } from "@serenityjs/raknet";
import { type BinaryStream, Endianness } from "@serenityjs/binarystream";

import { Enchant } from "./enchant";

class EnchantOption extends DataType {
	public cost: number;
	public slotFlags: number;
	public equipEnchantments: Array<Enchant>;
	public heldEnchantments: Array<Enchant>;
	public selfEnchantments: Array<Enchant>;
	public name: string;
	public optionId: number;

	public constructor(
		cost: number,
		slotFlags: number,
		equipEnchantments: Array<Enchant>,
		heldEnchantments: Array<Enchant>,
		selfEnchantments: Array<Enchant>,
		name: string,
		optionId: number
	) {
		super();

		this.cost = cost;
		this.slotFlags = slotFlags;
		this.equipEnchantments = equipEnchantments;
		this.heldEnchantments = heldEnchantments;
		this.selfEnchantments = selfEnchantments;
		this.name = name;
		this.optionId = optionId;
	}

	public static override read(stream: BinaryStream): Array<EnchantOption> {
		const options: Array<EnchantOption> = [];

		const length = stream.readVarInt();

		for (let index = 0; index < length; index++) {
			const cost = stream.readVarInt();

			const slotFlags = stream.readInt32(Endianness.Little);

			const equipEnchantments = Enchant.read(stream);
			const heldEnchantments = Enchant.read(stream);
			const selfEnchantments = Enchant.read(stream);

			const name = stream.readVarString();

			const optionId = stream.readUint32();

			options.push(
				new EnchantOption(
					cost,
					slotFlags,
					equipEnchantments,
					heldEnchantments,
					selfEnchantments,
					name,
					optionId
				)
			);
		}

		return options;
	}

	public static override write(
		stream: BinaryStream,
		value: Array<EnchantOption>
	): void {
		stream.writeVarInt(value.length);

		for (const option of value) {
			stream.writeVarInt(option.cost);

			stream.writeInt32(option.slotFlags, Endianness.Little);

			Enchant.write(stream, option.equipEnchantments);
			Enchant.write(stream, option.heldEnchantments);
			Enchant.write(stream, option.selfEnchantments);

			stream.writeVarString(option.name);

			stream.writeUint32(option.optionId);
		}
	}
}

export { EnchantOption };
