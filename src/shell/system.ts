import { parrot, bio, plan, honestBio, hosts, resolv } from './constants';
import * as Ansi from './Ansi';
import { Executable } from './proc';
import { commands } from './commands';

const YEAR = new Date().getFullYear();

export class ExecutableFile {
  type = 'executable';

  exec: Executable;

  constructor(exec: Executable) {
    this.exec = exec;
  }

  toString() {
    return '<Executable>';
  }
}

export type FsObject = string | Record<string, never> | ExecutableFile;

interface FileMap {
  [key: string]: FsObject;
}

export interface FS {
  get(path: string): FsObject | undefined;
  put(path: string, object: any): void;
  delete(path: string, keepFolder: boolean): void;
  scan(prefix: string): string[];
  list(path: string): string[];
  isFile(path: string): boolean;
  isDir(path: string): boolean;
  exists(path: string): boolean;
  __fs: FileMap;
}

export class FileSystem implements FS {
  __fs: FileMap = {
    '/home/barry/linkedin.txt': Ansi.link('https://www.linkedin.com/in/barry-mcandrews') + '\n',
    '/home/barry/github.txt': Ansi.link('https://github.com/barrymcandrews') + '\n',
    '/home/barry/copyright.txt': 'Made by Barry McAndrews © ' + YEAR + '\n',
    '/home/barry/parrot.txt': parrot,
    '/home/barry/bio.txt': bio,

    '/home/barry/.trash/bio-draft.txt': honestBio,
    '/home/barry/.trash/ideas.txt': plan,

    '/etc/conf': 'get outta here',
    '/etc/sysflags': '🏳️‍🌈',
    '/etc/hosts': hosts,
    '/etc/resolv.conf': resolv,

    '/usr/bin/__folder__': {},
    '/var/__folder__': {},
    '/var/www/__folder__': {},
    '/tmp/__folder__': {},

    '/opt/aurora-server/README.md':
      Ansi.link('https://github.com/barrymcandrews/aurora-server') + '\n',
    '/opt/raven-react/README.md': Ansi.link('https://github.com/barrymcandrews/raven-react') + '\n',
    '/opt/raven-iac/README.md': Ansi.link('https://github.com/barrymcandrews/raven-iac') + '\n',
    '/opt/chatbot/README.md': Ansi.link('https://github.com/barrymcandrews/chatbot') + '\n',
    '/opt/raven-cli/README.md': Ansi.link('https://github.com/barrymcandrews/raven-cli') + '\n'
  };

  constructor() {
    // Add all commands to filesystem
    for (const e of Object.keys(commands)) {
      this.put('/usr/bin/' + e, new ExecutableFile(commands[e]));
    }
  }

  get(path: string): FsObject | undefined {
    return this.__fs[path];
  }

  put(path: string, object: any) {
    if (path.endsWith('/')) {
      throw Error('Invalid Path: path can not end in a slash');
    } else if (path.includes('//')) {
      throw Error('Invalid Path: path can not contain a double slash');
    }
    this.__fs[path] = object;
  }

  delete(path: string, keepFolder = false) {
    if (keepFolder) {
      const folderPath = path.slice(0, path.lastIndexOf('/')) + '/__folder__';
      if (!this.__fs.hasOwnProperty(folderPath)) {
        this.put(folderPath, {});
      }
    }
    delete this.__fs[path];
  }

  scan(prefix: string): string[] {
    return Object.keys(this.__fs).filter(x => x.startsWith(prefix));
  }

  list(path: string): string[] {
    return Array.from(
      new Set(
        Object.keys(this.__fs)
          .filter(s => s.startsWith(path))
          .filter(s => path === '/' || s.charAt(path.length) === '/')
          .map(s => s.slice(path.length))
          .map(s => s.replace(/^\//, ''))
          .map(s => s.split('/')[0])
          .filter(s => !s.endsWith('__folder__'))
      )
    );
  }

  isFile(path: string): boolean {
    return path in this.__fs && !path.endsWith('__folder__');
  }

  isDir(path: string): boolean {
    return path === '/' || Object.keys(this.__fs).some(s => s.startsWith(path + '/'));
  }

  exists(path: string): boolean {
    return this.isFile(path) || this.isDir(path);
  }
}
