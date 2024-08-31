import { getName } from "..";

describe("getName function", () => {
  it("should return '@serenityjs/cli'", () => {
    const expectedOutput = "@serenityjs/cli";
    const result = getName();
    expect(result).toBe(expectedOutput);
  });
});
