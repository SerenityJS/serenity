import { getName } from "..";

describe("getName function", () => {
  it("should return '@serenityjs/data'", () => {
    const expectedOutput = "@serenityjs/data";
    const result = getName();
    expect(result).toBe(expectedOutput);
  });
});
