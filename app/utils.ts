export function parseTreeContentAndGetNames(treeContent: string) {
  const treeContentBlock = treeContent.split('\0').slice(1, -1).join('\0').trim()
  const treeContentBlocks = treeContentBlock?.split('\0').flatMap(block => block.split(' ').at(-1))
  return `${treeContentBlocks?.join('\n')}\n`
}
