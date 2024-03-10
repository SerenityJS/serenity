import { getName } from "..";

describe("getName function", () => {
	it("should return '@serenityjs/raknet'", () => {
		const expectedOutput = "@serenityjs/raknet";
		const result = getName();
		expect(result).toBe(expectedOutput);
	});
});
