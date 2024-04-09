import { getName } from "..";

describe("getName function", () => {
  it("should return '@serenityjs/block'", () => {
    const expectedOutput = "@serenityjs/block";
    const result = getName();
    expect(result).toBe(expectedOutput);
  });
});
