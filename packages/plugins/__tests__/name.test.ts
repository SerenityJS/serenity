import { getName } from "..";

describe("getName function", () => {
  it("should return '@serenityjs/plugins'", () => {
    const expectedOutput = "@serenityjs/plugins";
    const result = getName();
    expect(result).toBe(expectedOutput);
  });
});
