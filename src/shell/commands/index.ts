import * as Ansi from '../Ansi';
import Router from 'next/router';
import { columns, getAbsolutePath, basename, parseArgs } from './helpers';
import ed from './ed';
import sh from './sh';
import snake from './snake';
import { Executable, IO, listProcesses } from '../proc';

let cwd = '/home/barry';

/*
 *  Command Functions
 */

async function help(args: string[], io: IO) {
  const cmds = Object.keys(commands).sort();
  io.out('Available commands:\n');
  io.out((await columns(cmds, io)) + '\n');
  return 0;
}

async function open(args: string[], io: IO) {
  if (args.length !== 2) {
    io.out('Usage: open <url>\n');
    return 1;
  }

  if (!args[1].startsWith('http://') && !args[1].startsWith('https://')) {
    args[1] = 'http://' + args[1];
  }

  window.open(args[1], '_blank');
  return 0;
}

async function mail(args: string[], io: IO) {
  if (args.length !== 2) {
    io.out('Usage: mail <email address>\n');
    return 1;
  }

  window.open('mailto:' + args[1], '_self');
  return 0;
}

async function clear(args: string[], io: IO) {
  io.out(Ansi.clearScreen);
  return 0;
}

async function whoami(args: string[], io: IO) {
  io.out('barry\n');
  return 0;
}

async function pwd(args: string[], io: IO) {
  io.out(cwd + '\n');
  return 0;
}

async function aws(args: string[], io: IO) {
  io.out(
    'lol you thought I implemented the AWS CLI in this shell.\n\n' +
      'The AWS CLI is wayyyy too complicated for me to recreate in this fake shell. ' +
      "I mean don't get me wrong. I could do it. I'd just rather use the time to get another certification.\n\n"
  );
  return 0;
}

async function cd(args: string[], io: IO) {
  if (!args[1]) args[1] = '/home/barry';
  const path = getAbsolutePath(args[1], io.env);
  if (io.fs.isDir(path)) {
    cwd = path;
    io.env.put('PWD', cwd);
    return 0;
  } else {
    const message = io.fs.isFile(args[1])
      ? 'cd: not a directory: '
      : 'cd: no such file or directory: ';
    io.out(message + args[1] + '\n');
    return 1;
  }
}

async function ls(args: string[], io: IO) {
  const { flags, positionalArgs } = parseArgs(args);
  const showAll = flags.includes('a');
  const showLong = flags.includes('l');

  const dir = positionalArgs.length === 1 ? cwd : getAbsolutePath(positionalArgs[1], io.env);
  if (io.fs.exists(dir)) {
    const entries = io.fs
      .list(dir)
      .filter(x => showAll || !x.startsWith('.'))
      .sort();
    if (!showLong) {
      io.out(await columns(entries, io));
    } else {
      for (const e of entries) {
        io.out(e + '\n');
      }
    }
  } else {
    io.out('ls: no such file or directory\n');
    return 1;
  }
  return 0;
}

async function mkdir(args: string[], io: IO) {
  args.shift();
  if (args.length < 1) {
    io.out('Usage: mkdir <directory...>\n');
    return 64;
  }
  return args
    .map(arg => {
      let path = getAbsolutePath(arg, io.env);
      if (io.fs.exists(path)) {
        io.out('mkdir: ' + arg + ': File exists\n');
        return 1;
      } else {
        path = path.replace(/\/$/, '');
        io.fs.put(path + '/__folder__', {});
        return 0;
      }
    })
    .reduce((a, b) => a || b);
}

async function rmdir(args: string[], io: IO) {
  args.shift();
  if (args.length < 1) {
    io.out('Usage: rmdir <directory...>\n');
    return 1;
  }
  return args
    .map(arg => {
      const path = getAbsolutePath(arg, io.env);
      const results = io.fs.scan(path + '/');
      if (results.length !== 1 || results[0] !== path + '/__folder__') {
        io.out(`rmdir: ${arg}: Directory is not empty\n`);
        return 1;
      } else {
        io.fs.delete(results[0], false);
        return 0;
      }
    })
    .reduce((a, b) => a || b);
}

async function cat(args: string[], io: IO) {
  const path = getAbsolutePath(args[1], io.env);
  if (io.fs.isFile(path)) {
    io.out(io.fs.get(path) + '\n');
    return 0;
  } else {
    const msg = io.fs.exists(path) ? ': Is a directory' : ': No such file or directory';
    io.out('cat: ' + args[1] + msg + '\n');
    return 1;
  }
}

async function echo(args: string[], io: IO) {
  io.out(args.slice(1).join(' ') + '\n');
  return 0;
}

async function touch(args: string[], io: IO) {
  if (args.length < 2) {
    io.out('Usage: touch <file..>\n');
    return 1;
  }

  for (let i = 1; i < args.length; i++) {
    const path = getAbsolutePath(args[i], io.env);
    try {
      io.fs.put(path, '');
    } catch (e) {
      io.out(`touch: unable to create file ${args[i]}\n`);
      return 1;
    }
  }
  return 0;
}

async function mirror(args: string[], io: IO) {
  io.out('say something: ');
  const str = await io.in();
  io.out(str + '\n');
  return 0;
}

async function goto(args: string[], io: IO) {
  if (args.length !== 2) {
    io.out('Usage: goto <page>\n');
    return 1;
  }
  await Router.push(args[1]);
  return 0;
}

async function mv(args: string[], io: IO) {
  if (args.length !== 3) {
    io.out('Usage: mv <source> <target>\n');
    return 1;
  }
  const source = getAbsolutePath(args[1], io.env);
  const target = getAbsolutePath(args[2], io.env);
  const isFolder = args[2].endsWith('/');
  if (!io.fs.exists(source)) {
    io.out(`mv: rename ${args[1]} to ${args[2]}: No such file or directory\n`);
    return 1;
  }

  if (io.fs.isFile(source)) {
    const targetFolder = isFolder ? target : target.substring(0, target.lastIndexOf('/'));
    if (!io.fs.isDir(targetFolder)) {
      io.out(`mv: ${args[2]}: No such file or directory\n`);
      return 1;
    }
    let destinationPath = io.fs.isDir(target) ? target + '/' + basename(source) : target;
    destinationPath = destinationPath.replaceAll('//', '/');
    io.fs.put(destinationPath, io.fs.get(source));
    io.fs.delete(source, false);
  }

  if (io.fs.isDir(source)) {
    io.out('mv: Directories can not be moved\n');
  }
  return 0;
}

async function cp(args: string[], io: IO) {
  if (args.length !== 3) {
    io.out('Usage: cp <source> <target>\n');
    return 1;
  }
  const source = getAbsolutePath(args[1], io.env);
  const target = getAbsolutePath(args[2], io.env);
  const isFolder = args[2].endsWith('/');
  if (!io.fs.exists(source)) {
    io.out(`cp: copy ${args[1]} to ${args[2]}: No such file or directory\n`);
    return 1;
  }

  if (io.fs.isFile(source)) {
    const targetFolder = isFolder ? target : target.substring(0, target.lastIndexOf('/'));
    if (!io.fs.isDir(targetFolder)) {
      io.out(`cp: ${args[2]}: No such file or directory\n`);
      return 1;
    }
    let destinationPath = io.fs.isDir(target) ? target + '/' + basename(source) : target;
    destinationPath = destinationPath.replaceAll('//', '/');
    io.fs.put(destinationPath, io.fs.get(source));
  }

  if (io.fs.isDir(source)) {
    io.out('cp: Directories can not be copied\n');
  }
  return 0;
}

async function rm(args: string[], io: IO) {
  const { flags, positionalArgs } = parseArgs(args);
  for (const item of positionalArgs.splice(1)) {
    const path = getAbsolutePath(item, io.env);
    if (io.fs.isFile(path)) {
      io.fs.delete(path, true);
    } else if (io.fs.isDir(path)) {
      if (path === '/') {
        io.out(`rm: cannot remove '/': Operation not permitted\n`);
        io.out(`rm: nice try though\n`);
        return 1;
      } else if (!flags.includes('r')) {
        io.out(`rm: ${item}: is a directory\n`);
        return 1;
      } else {
        const folderPath = path.slice(0, path.lastIndexOf('/')) + '/__folder__';
        if (!io.fs.exists(folderPath)) {
          io.fs.put(folderPath, {});
        }
        io.fs.scan(path + '/').forEach(result => {
          io.fs.delete(result, false);
        });
        return 0;
      }
    } else {
      io.out(`rm: ${item}: No such file or directory\n`);
      return 1;
    }
  }
  return 0;
}

async function date(args: string[], io: IO) {
  io.out(new Date(Date.now()).toString() + '\n');
  return 0;
}

async function hostname(args: string[], io: IO) {
  io.out('hyperion\n');
  return 0;
}

async function tree(args: string[], io: IO) {
  console.log(io.fs.__fs);
  return 0;
}

async function ps(args: string[], io: IO) {
  io.out(`PID \tCMD\n`);
  listProcesses().forEach(p => {
    io.out(`${p.pid} \t${p.args?.join(' ')}\n`);
  });
  return 0;
}

async function test(args: string[], io: IO) {
  args.shift();
  if (args.pop() !== ']') {
    io.out('[: ] expected\n');
    return 2;
  }

  // Empty strings are considered false
  if (args.length === 0) return 1;
  // Strings are considered true
  else if (args.length === 1) return 0;
  else if (args.length === 2) {
    io.out(`[: parse error: condition expected: ${args[0]}\n`);
    return 2;
  } else if (args.length === 3) {
    const a = args[0];
    const b = args[2];
    const compareFns: { [key: string]: () => boolean } = {
      '=': () => a === b,
      '-eq': () => a === b
      //TODO: add more comparisons
    };
    return compareFns[args[1]]() ? 0 : 1;
  } else {
    io.out(`[: too many arguments\n`);
    return 2;
  }
}

interface Executables {
  [command: string]: Executable;
}

export const commands: Executables = {
  help: help,
  open: open,
  mail: mail,
  pwd: pwd,
  cd: cd,
  ls: ls,
  mkdir: mkdir,
  rmdir: rmdir,
  cat: cat,
  echo: echo,
  clear: clear,
  whoami: whoami,
  aws: aws,
  mirror: mirror,
  touch: touch,
  goto: goto,
  mv: mv,
  cp: cp,
  date: date,
  hostname: hostname,
  ed: ed,
  rm: rm,
  ps: ps,
  sh: sh,
  '[': test,
  snake: snake
};

if (process.env.NODE_ENV !== 'production') {
  commands.tree = tree;
}
