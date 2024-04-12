import { getName } from "..";

describe("getName function", () => {
  it("should return '@serenityjs/entity'", () => {
    const expectedOutput = "@serenityjs/entity";
    const result = getName();
    expect(result).toBe(expectedOutput);
  });
});
