import * as fs from 'fs';
import * as zlib from 'zlib'

const args = process.argv.slice(2);
const command = args[0];

enum Commands {
  Init = "init",
  CatFile = "cat-file",
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
        const hashPrefix = hash.substring(0, 2);
        const fileName = hash.substring(2);
        const zipcontent = fs.readFileSync(`.git/objects/${hashPrefix}/${fileName}`);
        let unzipped = zlib.unzipSync(zipcontent).toString();
        const content = unzipped.split('\0').at(1)
        if (!content) {
          throw new Error(`File ${fileName} not found`);
        }
        process.stdout.write(content)
        break;

      default:
        throw new Error(`Unknown flag ${flag}`);
    }
    break
  default:
    throw new Error(`Unknown command ${command}`);
}
