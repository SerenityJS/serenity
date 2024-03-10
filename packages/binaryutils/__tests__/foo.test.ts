import { foo } from "..";

describe("foo function", () => {
  it("should return '@serenityjs/binaryutils'", () => {
    const expectedOutput = "@serenityjs/binaryutils";
    const result = foo();
    expect(result).toBe(expectedOutput);
  });
});
