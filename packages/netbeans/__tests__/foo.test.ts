import { foo } from "..";

describe("foo function", () => {
	it("should return '@serenityjs/netbeans'", () => {
		const expectedOutput = "@serenityjs/netbeans";
		const result = foo();
		expect(result).toBe(expectedOutput);
	});
});
