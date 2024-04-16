import { getName } from "..";

describe("getName function", () => {
  it("should return '@serenityjs/server-ui'", () => {
    const expectedOutput = "@serenityjs/server-ui";
    const result = getName();
    expect(result).toBe(expectedOutput);
  });
});
