import { Environment } from './environment';
import { ExecutableFile, FileSystem, FS } from './system';
import * as Ansi from './Ansi';
import * as Ascii from './Ascii';

class Notifier {
  e = new EventTarget();

  async wait() {
    return new Promise(resolve => {
      this.e.addEventListener('notify', resolve);
    });
  }

  async notify() {
    this.e.dispatchEvent(new Event('notify'));
  }
}

export class Pipe {
  buffer = '';

  notifier = new Notifier();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  handler = (data: string) => {};

  read = async () => {
    if (this.buffer.length === 0) {
      await this.notifier.wait();
    }
    const str = this.buffer;
    this.buffer = '';
    return str;
  };

  write = async (str: string) => {
    this.buffer += str;
    this.handler(str);
    await this.notifier.notify();
  };

  onWrite(fn: (data: string) => void) {
    this.handler = fn;
  }
}

/**
 * Pipe that ensures bytes are received in the chunks that they are sent.
 * This is used by shell to correctly group control characters
 */
export class GroupedPipe extends Pipe {
  groupedBuffer: string[] = [];

  notifier = new Notifier();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  handler = (data: string) => {};

  read = async () => {
    if (this.groupedBuffer.length === 0) {
      await this.notifier.wait();
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.groupedBuffer.pop()!;
  };

  write = async (str: string) => {
    this.groupedBuffer.unshift(str);
    this.handler(str);
    await this.notifier.notify();
  };

  onWrite(fn: (data: string) => void) {
    this.handler = fn;
  }
}

export interface IO {
  in: () => Promise<string>;
  out: (str: string) => void;
  err: (str: string) => void;
  env: Environment;
  fs: FS;
  proc: Process;
}

export type Executable = (args: string[], io: IO) => Promise<number>;

export interface Process {
  pid: number;
  env: Environment;
  stdin: Pipe;
  stdout: Pipe;
  stderr: Pipe;
  args?: string[];

  start(onError?: (e: any) => void): void;
  cancel(): void;
  wait(): Promise<number>;
}

const processes: { [key: number]: Process } = {};
let nextPid = 0;

export function init(command: string[]) {
  const env = new Environment();
  const fs = new FileSystem();
  return createProcess(command, env, fs);
}

export function createProcess(command: string[], env: Environment, fs: FileSystem): Process | null {
  function findExecutable(): Executable | null {
    for (const dir of env.get('PATH').split(';')) {
      const path = dir + '/' + command[0];
      const file = fs.get(path) || {};
      if (typeof file === 'object' && file.hasOwnProperty('exec')) {
        return (file as ExecutableFile).exec;
      }
    }
    return null;
  }

  const exec = findExecutable();
  if (exec == null) {
    return null;
  }

  const pid = nextPid++;
  const process = new AsyncProcess(pid, exec, command, env, fs);
  processes[pid] = process;
  return process;
}

export function listProcesses() {
  return Object.values(processes);
}

class AsyncProcess implements Process {
  pid: number;

  exec: Executable;

  args: string[];

  env: Environment;

  fs: FileSystem;

  stdin = new Pipe();

  stdout = new Pipe();

  stderr = new Pipe();

  promise?: Promise<number>;

  constructor(pid: number, exec: Executable, args: string[], env: Environment, fs: FileSystem) {
    this.pid = pid;
    this.exec = exec;
    this.args = args;
    this.env = env;
    this.fs = fs;
  }

  start(onError?: (e: any) => void) {
    const io: IO = {
      env: this.env,
      fs: this.fs,
      in: async () => input(this.stdin.read, this.stdout.write),
      out: async (str: string) => this.stdout.write(str),
      err: async (str: string) => this.stderr.write(str),
      proc: this
    };
    this.promise = this.exec(this.args, io).catch(onError).then();

    this.promise.then(() => {
      delete processes[this.pid];
    });
  }

  cancel(): void {
    throw Error('Async Processes can not be cancelled.');
  }

  wait(): Promise<number> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.promise!;
  }
}

/**
 * This function is connected to io.in() for all processes. It provides an editable line.
 * To read directly from stdin the user should use io.proc.stdin.read()
 *
 * @param inFn -- should be set to io.proc.stdin.read
 * @param outFn -- should be set to io.proc.stdin.write
 */
export async function input(
  inFn: () => Promise<string>,
  outFn: (str: string) => void
): Promise<string> {
  let cursor = 0;
  let buffer = '';
  const io = {
    in: inFn,
    out: outFn
  };

  function cursorForward() {
    if (cursor < buffer.length) {
      cursor += 1;
      io.out(Ansi.CURSOR_FORWARD);
    } else {
      io.out(Ascii.BEL);
    }
  }

  function cursorBackwards() {
    if (cursor > 0) {
      cursor -= 1;
      io.out(Ansi.CURSOR_BACKWARDS);
    } else {
      io.out(Ascii.BEL);
    }
  }

  function backspace() {
    if (cursor > 0) {
      cursor--;
      buffer = buffer.substr(0, cursor) + buffer.substr(cursor + 1);
      io.out('\b \b'); // Code to delete one character
    } else {
      io.out(Ascii.BEL);
    }
  }

  function handleData(data: string) {
    buffer = buffer.substr(0, cursor) + data + buffer.substr(cursor);
    cursor += data.length;
    io.out(data);
  }

  const handlers = {
    [Ascii.ACK]: cursorBackwards,
    [Ansi.CURSOR_BACKWARDS]: cursorBackwards,
    [Ascii.STX]: cursorForward,
    [Ansi.CURSOR_FORWARD]: cursorForward,
    [Ascii.DEL]: backspace,
    [Ascii.BS]: backspace
  };

  let ch: string;
  while ((ch = await io.in()) !== Ascii.CR) {
    if (ch in handlers) {
      handlers[ch]();
    } else {
      const stripped = ch.replace(/[^ -~]+/g, '');
      if (stripped) handleData(stripped);
    }
  }
  io.out('\n');
  return buffer;
}
