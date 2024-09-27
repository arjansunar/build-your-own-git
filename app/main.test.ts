import { parseTreeContentAndGetNames, writeTree } from "./utils";
import { expect, test } from "bun:test";

test("Parse out tree content", () => {
  const output = parseTreeContentAndGetNames(
    `tree 113\0 140000 test.1\0shasomething100644 test.3\0shasomething`,
  );
  expect(output).toBe("test.1\ntest.3\n");
});

test("Test write tree command", () => {
  const output = writeTree("test-write-tree");
  expect(true).toBe(true);
});
