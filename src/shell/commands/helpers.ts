import { IO } from '../proc';
import { Environment } from '../environment';

export async function columns(list: string[], io: IO): Promise<string> {
  const termWidth = parseInt(io.env.get('COLS'));
  const colWidth = Math.max(...list.map(x => x.length + 1));
  const numCols = Math.min(Math.floor(termWidth / colWidth), list.length);

  const chunks: string[][] = [];
  let nCols = numCols;
  while (list.length) {
    const chunkSize = Math.ceil(list.length / nCols--);
    const chunk = list.slice(0, chunkSize);
    chunks.push(chunk);
    list = list.slice(chunkSize);
  }

  const largestList = Math.max(...chunks.map(x => x.length));
  let str = '';
  for (let i = 0; i < largestList; i++) {
    for (let j = 0; j < numCols; j++) {
      if (chunks[j].length > i) {
        const spaces = colWidth - chunks[j][i].length;
        str += chunks[j][i] + Array(spaces + 1).join(' ');
      }
    }
    str += '\n';
  }
  return str;
}

export function getAbsolutePath(path: string, env: Environment) {
  if (!path) path = '';
  if (path.startsWith('/')) return path;
  if (path.startsWith('~')) {
    return path.replace('~', env.get('HOME'));
  }
  const cwd = env.get('PWD');
  const prefix = cwd === '/' ? '/' : cwd + '/';
  path = prefix + path;
  const pathItems = path.split('/').filter(s => s !== '.');
  for (let i = 0; i < pathItems.length; i++) {
    if (pathItems[i] === '..') {
      pathItems.splice(i - 1, 2);
      i = 0;
    }
  }
  path = pathItems.join('/');
  path = path === '' ? '/' : path.replace(/\/$/, '');
  return path;
}

export function basename(str: string) {
  return str.split('/').reverse()[0];
}

export function parseArgs(args: string[]): { flags: string[]; positionalArgs: string[] } {
  return {
    flags: args
      .filter(x => x.startsWith('-'))
      .join('')
      .replace(/-/g, '')
      .split(''),
    positionalArgs: args.filter(x => !x.startsWith('-'))
  };
}
