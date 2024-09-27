import * as fs from "fs";
import * as zlib from "zlib";
import { parseTreeContentAndGetNames, writeTree, hashObject } from "./utils";

const args = process.argv.slice(2);
const command = args[0];

enum Commands {
  Init = "init",
  CatFile = "cat-file",
  HashObject = "hash-object",
  LsTree = "ls-tree",
  WriteTree = "write-tree",
  CommitTree = "commit-tree",
}

function getFlag() {
  return args.at(1);
}

function getFlags() {
  return args.at(1)?.split("");
}

function getPathOrSha() {
  return args.at(-1);
}

function getHashPrefix(hash: string) {
  return hash.substring(0, 2);
}

function getFileNameFromHash(hash: string) {
  return hash.substring(2);
}

function getFolderPath(hash: string) {
  return `.git/objects/${getHashPrefix(hash)}`;
}

function getFilePath(hash: string) {
  return `.git/objects/${getHashPrefix(hash)}/${getFileNameFromHash(hash)}`;
}

switch (command) {
  case Commands.Init:
    // You can use print statements as follows for debugging, they'll be visible when running tests.
    console.log("Logs from your program will appear here!");

    // Uncomment this block to pass the first stage
    fs.mkdirSync(".git", { recursive: true });
    fs.mkdirSync(".git/objects", { recursive: true });
    fs.mkdirSync(".git/refs", { recursive: true });
    fs.writeFileSync(".git/HEAD", "ref: refs/heads/main\n");
    console.log("Initialized git directory");
    break;

  case Commands.CatFile:
    const flag = args[1];
    const hash = args[2];

    switch (flag) {
      case "-p":
        if (hash?.length !== 40) {
          throw new Error(`Invalid hash ${hash}. Must be 40 chars long`);
        }
        const zipcontent = fs.readFileSync(getFilePath(hash));
        let unzipped = zlib.unzipSync(zipcontent).toString();
        const content = unzipped.split("\0").at(1);
        if (!content) {
          throw new Error(`content not found`);
        }
        process.stdout.write(content);
        break;

      default:
        throw new Error(`Unknown flag ${flag}`);
    }
    break;

  case Commands.HashObject:
    const contentFilePath = args[2];
    const hashObjRes = hashObject(contentFilePath);
    if (getFlags()?.includes("w")) {
      fs.mkdirSync(getFolderPath(hashObjRes.hash), { recursive: true });
      fs.writeFileSync(getFilePath(hashObjRes.hash), hashObjRes.compressed);
    }

    process.stdout.write(hashObjRes.hash);
    break;

  case Commands.LsTree:
    const treeSha = getPathOrSha();
    if (!treeSha) {
      throw new Error(`No path or sha provided ${treeSha}`);
    }

    if (getFlag() == "--name-only") {
      const treeContent = fs.readFileSync(getFilePath(treeSha));
      const treeBuffer = zlib.unzipSync(treeContent).toString();
      const formattedNames = parseTreeContentAndGetNames(treeBuffer);
      process.stdout.write(formattedNames ?? "");
    }
    break;
  case Commands.WriteTree:
    const _hash = writeTree(process.cwd());
    process.stdout.write(_hash.hash);

    break;
  case Commands.CommitTree:
    break;
  default:
    throw new Error(`Unknown command ${command}`);
}
