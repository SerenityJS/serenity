import { getName } from "..";

describe("getName function", () => {
	it("should return '@serenityjs/logger'", () => {
		const expectedOutput = "@serenityjs/logger";
		const result = getName();
		expect(result).toBe(expectedOutput);
	});
});
