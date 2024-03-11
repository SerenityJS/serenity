import { BinaryStream } from "..";

describe("placeholder tests", () => {
	it("should be a placeholder", () => {
		const bin = new BinaryStream();
		bin.writeString16("placeholder");
		const read = bin.readString16();

		expect(read).toBe("placeholder");
	});
});
