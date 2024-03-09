import { getName } from "..";

describe("getName function", () => {
	it("should return 'launcher'", () => {
		const expectedOutput = "launcher";
		const result = getName();
		expect(result).toBe(expectedOutput);
	});
});
