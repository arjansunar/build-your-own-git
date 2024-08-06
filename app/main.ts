import * as fs from 'fs';
import * as zlib from 'zlib'
import { createHash } from 'crypto'

const args = process.argv.slice(2);
const command = args[0];

enum Commands {
  Init = "init",
  CatFile = "cat-file",
  HashObject = "hash-object",
  LsTree = "ls-tree"
}

enum FileModes {
  File = 100644,
  ExFile = 100755,
  SymlinkFile = 120000
}

function getFlag() {
  return args.at(1)
}

function getFlags() {
  return args.at(1)?.split('')
}

function getPathOrSha() {
  return args.at(-1)
}

function getHashPrefix(hash: string) {
  return hash.substring(0, 2)
}

function getFileNameFromHash(hash: string) {
  return hash.substring(2)
}

function getFolderPath(hash: string) {
  return `.git/objects/${getHashPrefix(hash)}`
}

function getFilePath(hash: string) {
  return `.git/objects/${getHashPrefix(hash)}/${getFileNameFromHash(hash)}`
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
        const content = unzipped.split('\0').at(1)
        if (!content) {
          throw new Error(`content not found`);
        }
        process.stdout.write(content)
        break;

      default:
        throw new Error(`Unknown flag ${flag}`);
    }
    break

  case Commands.HashObject:
    const contentFilePath = args[2];
    const content = fs.readFileSync(contentFilePath);
    const uncompresed = Buffer.from(`blob ${content.length}\0${content}`);
    const hasher = createHash('sha1');
    const _hash = hasher.update(uncompresed).digest('hex').trim();

    if (getFlags()?.includes('w')) {
      fs.mkdirSync(getFolderPath(_hash), { recursive: true });
      const compressed = zlib.deflateSync(uncompresed);
      fs.writeFileSync(getFilePath(_hash), compressed);
    }

    process.stdout.write(_hash)
    break

  case Commands.LsTree:
    const treeSha = getPathOrSha()
    if (!treeSha) {
      throw new Error(`No path or sha provided ${treeSha}`);
    }

    if (getFlag() == '--name-only') {
      const treeContent = fs.readFileSync(getFilePath(treeSha));
      console.log({ treeContent })
      const treeBuffer = zlib.unzipSync(treeContent).toString();
      const treeContentBlock = treeBuffer.split('\0').at(1)
      const treeContentBlocks = treeContentBlock?.split('\0').flatMap(block => block.split(' ').at(-1))
      const formattedNames = treeContentBlocks?.join('\n')
      process.stdout.write(formattedNames ?? "")
    }
    break
  default:
    throw new Error(`Unknown command ${command}`);
}
