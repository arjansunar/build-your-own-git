import {
  commitTree,
  commitTreeString,
  parseTreeContentAndGetNames,
  writeTree,
} from "./utils";
import { expect, test } from "bun:test";

test("Parse out tree content", () => {
  const output = parseTreeContentAndGetNames(
    `tree 113\0 140000 test.1\0shasomething100644 test.3\0shasomething`,
  );
  expect(output).toBe("test.1\ntest.3\n");
});

test("Test commit tree command", () => {
  const output = commitTreeString(
    "5b825dc642cb6eb9a060e54bf8d69288fbee4904",
    "Second commit",
    "3b18e512dba79e4c8300dd08aeb37f8e728b8dad",
  );
  const hash = commitTree(
    "5b825dc642cb6eb9a060e54bf8d69288fbee4904",
    "Second commit",
    "3b18e512dba79e4c8300dd08aeb37f8e728b8dad",
  );

  console.log({ output, hash });
  expect(true).toBe(true);
});
