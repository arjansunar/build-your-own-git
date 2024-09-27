import * as fs from "fs";
import * as path from "path";
import * as zlib from "zlib";

import { createHash } from "crypto";
export function parseTreeContentAndGetNames(treeContent: string) {
  const treeContentBlock = treeContent
    .split("\0")
    .slice(1, -1)
    .join("\0")
    .trim();
  const treeContentBlocks = treeContentBlock
    ?.split("\0")
    .flatMap((block) => block.split(" ").at(-1));
  return `${treeContentBlocks?.join("\n")}\n`;
}

export function hashObject(path: string) {
  const content = fs.readFileSync(path);
  const uncompresed = Buffer.from(`blob ${content.length}\0${content}`);
  const hasher = createHash("sha1");
  return {
    hash: hasher.update(uncompresed).digest("hex").trim(),
    uncompresed,
    get compressed() {
      return zlib.deflateSync(uncompresed);
    },
  };
}

enum FileModes {
  File = 100644,
  ExFile = 100755,
  Dir = 40000,
  SymlinkFile = 120000,
}

class TreeEntry {
  public constructor(
    public mode: FileModes,
    public hash: string,
    public name: string,
  ) {}
}

const IGNORED_FILES = [".git"];
export function writeTree(currentPath: string) {
  const currentTreeEntries: TreeEntry[] = [];
  for (const file of fs.readdirSync(currentPath, { withFileTypes: true })) {
    if (IGNORED_FILES.includes(file.name)) {
      return;
    }
    const stats = fs.statSync(path.join(currentPath, file.name));

    if (stats.isDirectory()) {
      const res = writeTree(path.join(currentPath, file.name));
      if (res) {
        currentTreeEntries.push(
          new TreeEntry(FileModes.Dir, res.hash, file.name),
        );
      }
    }
    if (stats.isFile()) {
      const hashObjRes = hashObject(path.join(currentPath, file.name));
      const isExecutable = !!(
        fs.statSync(path.join(currentPath, file.name)).mode & 0o111
      );
      const treeEntry = new TreeEntry(
        isExecutable ? FileModes.ExFile : FileModes.File,
        hashObjRes.hash,
        file.name,
      );
      currentTreeEntries.push(treeEntry);
    }
  }

  currentTreeEntries.at(0);
  const sortedEntries = currentTreeEntries
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(createTreeString);
  const hashedTree = hashTree(Buffer.concat(sortedEntries));
  fs.mkdirSync(getFolderPath(hashedTree.hash), { recursive: true });
  fs.writeFileSync(getFilePath(hashedTree.hash), hashedTree.compressed);
  return hashedTree;
}

const createTreeString = ({ mode, hash, name }: TreeEntry) => {
  const hexHashToBuffer = Buffer.from(hash, "hex");
  const bufferone = Buffer.concat([
    Buffer.from(`${mode} ${name}\0`),
    hexHashToBuffer,
  ]);

  return bufferone;
};

function hashTree(content: Buffer) {
  const blobContentLength = content.length;
  const blobHeader = Buffer.from(`tree ${blobContentLength}\0`);
  const blob = Buffer.concat([blobHeader, content]);
  const hasher = createHash("sha1");
  return {
    hash: hasher.update(blob).digest("hex").trim(),
    uncompresed: blob,
    get compressed() {
      return zlib.deflateSync(blob);
    },
  };
}

export function getFileNameFromHash(hash: string) {
  return hash.substring(2);
}

export function getHashPrefix(hash: string) {
  return hash.substring(0, 2);
}
export function getFolderPath(hash: string) {
  return `.git/objects/${getHashPrefix(hash)}`;
}

export function getFilePath(hash: string) {
  return `.git/objects/${getHashPrefix(hash)}/${getFileNameFromHash(hash)}`;
}
