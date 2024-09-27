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
  const hash = commitTree(
    "9c339ece773f838a4862c8e79b5e921289e86828",
    "monkey humpty yikes donkey humpty scooby",
    "c58187b103ae3942fac796f0a2cc473b7e9841b2",
  );

  expect(hash).toBe("034421c21c4b1806af879db89d5047c4c3f93b6a");
});
