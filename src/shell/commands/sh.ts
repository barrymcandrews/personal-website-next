import * as Ansi from '../Ansi';
import * as Ascii from '../Ascii';
import { createProcess, GroupedPipe, IO, Process } from '../proc';

const PREFIX = '$ ';

export default async function sh(args: string[], io: IO): Promise<number> {
  io.proc.stdin = new GroupedPipe();
  let cursor = 0;
  const history: string[] = [''];
  let historyIndex = 0;
  const stdin = io.proc.stdin;
  let subprocess: Process | undefined;
  let shouldExit = false;

  io.out(PREFIX);

  function renderLine(line?: string) {
    io.out(Ansi.cursorSavePosition);
    io.out(Ansi.eraseLine);
    io.out(Ascii.CR);
    io.out(PREFIX + (line || history[0]));
    io.out(Ansi.cursorRestorePosition);
  }

  async function handleData(data: string) {
    if (subprocess) {
      await subprocess.stdin.write(data);
      return;
    }
    switch (data) {
      case Ascii.CR:
        if (historyIndex !== 0) {
          history[0] = history[historyIndex];
          historyIndex = 0;
        }
        const line = history[0];
        if (history[0] !== '') {
          history.unshift('');
        }
        cursor = 0;
        io.out(Ascii.CR + Ascii.LF);
        await interpretLine(line);
        break;

      // Control-C
      case Ascii.ETX:
        io.out('^C');
        io.out(Ascii.CR + Ascii.LF);
        cursor = 0;
        if (history[0] !== '') {
          history.unshift('');
        }
        io.env.put('?', '130');
        io.out(PREFIX);
        break;

      // Control-D
      case Ascii.EOT:
        io.out('^D');
        io.out(Ascii.CR + Ascii.LF);
        cursor = 0;
        if (history[0] !== '') {
          history.unshift('');
        }
        io.out('exit\n');
        shouldExit = true;
        break;

      // Control-A
      case Ascii.SOH:
        cursor = 0;
        io.out(Ascii.CR);
        io.out(Ansi.cursorForward(PREFIX.length));
        break;

      // Control-E
      case Ascii.ENQ:
        cursor = history[historyIndex].length;
        io.out(Ascii.CR);
        io.out(Ansi.cursorForward(history[historyIndex].length + PREFIX.length));
        break;

      // Tab
      case Ascii.HT:
        break;

      // Backspace
      case Ascii.DEL:
      case Ascii.BS:
        if (historyIndex !== 0) {
          history[0] = history[historyIndex];
          historyIndex = 0;
        }
        if (cursor > 0) {
          cursor--;
          history[0] = history[0].substr(0, cursor) + history[0].substr(cursor + 1);
          io.out('\b');
          renderLine();
        } else {
          io.out(Ascii.BEL);
        }
        break;

      case Ascii.ACK:
      case Ansi.CURSOR_FORWARD:
        if (cursor < history[historyIndex].length) {
          cursor += 1;
          io.out(Ansi.CURSOR_FORWARD);
        } else {
          io.out(Ascii.BEL);
        }
        break;

      case Ascii.STX:
      case Ansi.CURSOR_BACKWARDS:
        if (cursor > 0) {
          cursor -= 1;
          io.out(Ansi.CURSOR_BACKWARDS);
        } else {
          io.out(Ascii.BEL);
        }
        break;

      case Ansi.CURSOR_UP:
        if (historyIndex === history.length - 1) {
          io.out(Ascii.BEL);
        }
        historyIndex = Math.min(history.length - 1, historyIndex + 1);
        renderLine(history[historyIndex]);
        io.out(Ascii.CR);
        io.out(Ansi.cursorForward(history[historyIndex].length + PREFIX.length));
        cursor = history[historyIndex].length;
        break;

      case Ansi.CURSOR_DOWN:
        if (historyIndex === 0) {
          io.out(Ascii.BEL);
        }
        historyIndex = Math.max(0, historyIndex - 1);
        renderLine(history[historyIndex]);
        io.out(Ascii.CR);
        io.out(Ansi.cursorForward(history[historyIndex].length + PREFIX.length));
        cursor = history[historyIndex].length;
        break;

      default:
        if (historyIndex !== 0) {
          history[0] = history[historyIndex];
          historyIndex = 0;
        }
        history[0] = history[0].substr(0, cursor) + data + history[0].substr(cursor);
        cursor += data.length;
        io.out(Ansi.cursorForward(data.length));
        renderLine();
    }
  }

  async function interpretLine(line: string) {
    // Substitute variables in line
    line = io.env.substitute(line);

    // Handle Environment Variables
    if (/^(\w)+=/.test(line)) {
      const separator = line.indexOf('=');
      io.env.put(line.substring(0, separator), line.substring(separator + 1));
      io.out(PREFIX);
      return;
    }

    // Split by space, ignoring spaces in quotes
    const lineArgs = (line.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || ['']).map(v =>
      /^(".*")|('.*')$/.test(v) ? v.slice(1, -1) : v
    );

    const command = lineArgs[0];
    const proc = createProcess(lineArgs, io.env, io.fs);
    if (proc) {
      proc.stdout.onWrite(io.proc.stdout.write);
      proc.stderr.onWrite(io.proc.stdout.write);

      subprocess = proc;
      proc.start(e => {
        io.out('sh: An unknown error occurred\n');
        if (process.env.NODE_ENV !== 'production') {
          io.out(`${e}\n`);
        }
      });
      proc.wait().then(returnCode => {
        subprocess = undefined;
        io.proc.stdin = stdin;
        io.env.put('?', returnCode === undefined ? '1' : returnCode.toString());
        io.out(PREFIX);
      });
    } else if (command.startsWith('exit')) {
      shouldExit = true;
    } else if (command !== '') {
      io.out('sh: command not found: ' + command + '\r\n');
      io.env.put('?', '127');
      io.out(PREFIX);
    } else {
      io.out(PREFIX);
    }
  }

  while (!shouldExit) {
    await handleData(await io.proc.stdin.read());
  }

  return 0;
}
