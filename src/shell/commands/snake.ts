import { IO } from '../proc';
import * as Ansi from '../Ansi';
import * as Ascii from '../Ascii';

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT
}

type Pair = [number, number];

const SNAKE_COLOR = '\u001b[32;1m';
const FOOD_COLOR = '\u001b[1;31m';
const NUMBER_OF_FOODS = 2;

export default async function snake(args: string[], io: IO) {
  let direction = Direction.RIGHT;
  let nextDirection = Direction.RIGHT;
  const body: Pair[] = [
    [3, 2],
    [2, 2],
    [1, 2]
  ];
  let foods: Pair[] = [];
  const cols = parseInt(io.env.get('COLS'));
  const rows = parseInt(io.env.get('ROWS'));
  let cancelled = false;

  function getScore() {
    return (body.length - 3) * 16;
  }

  async function placeFood(replace?: Pair) {
    if (replace) foods = await removeFromList(replace, foods);
    function random(): Pair {
      return [
        Math.floor(Math.random() * (cols - 2) + 1),
        Math.floor(Math.random() * (rows - 3) + 1)
      ];
    }
    const illegalPositions = body.concat(foods);
    let food;
    while (await pairInList((food = random()), illegalPositions));
    foods.push(food);
    io.out(Ansi.cursorTo(food[0], food[1]));
    io.out(FOOD_COLOR);
    io.out(Ansi.bold);
    io.out('$');
  }

  async function newHead(oldHead: Pair): Promise<Pair> {
    direction = nextDirection;
    const m: { [key: number]: Pair } = {
      [Direction.UP]: [oldHead[0], oldHead[1] - 1],
      [Direction.DOWN]: [oldHead[0], oldHead[1] + 1],
      [Direction.LEFT]: [oldHead[0] - 1, oldHead[1]],
      [Direction.RIGHT]: [oldHead[0] + 1, oldHead[1]]
    };
    return m[direction];
  }

  async function pairInList(pair: Pair, list: Pair[]) {
    // return list.some(p => p[0] == pair[0] && p[1] == pair[1]);
    for (const p of list) {
      if (p[0] === pair[0] && p[1] === pair[1]) {
        return true;
      }
    }
    return false;
  }

  async function removeFromList(pair: Pair, list: Pair[]) {
    return list.filter(p => p[0] !== pair[0] || p[1] !== pair[1]);
  }

  function padText(text: any, maxWidth: number, ch = ' ') {
    const len = text.toString().length;
    return text + ch.repeat(Math.max(maxWidth - len, 0));
  }

  async function updateHighScore() {
    const score = getScore();
    const data = JSON.parse((io.fs.get('/etc/snake') || '{}') as string);
    const lastScore = data.highscore || score;
    const highscore = Math.max(parseInt(lastScore), score);
    io.fs.put(
      '/etc/snake',
      JSON.stringify({
        highscore: highscore
      })
    );
    return highscore;
  }

  async function printBoundary() {
    // Top Line
    io.out(Ansi.cursorTo(0, 0));
    io.out('▒'.repeat(cols - 1));

    // Bottom Line
    io.out(Ansi.cursorTo(0, rows - 2));
    io.out('▒'.repeat(cols - 1));

    // Left & Right Lines
    for (let y = 0; y < rows - 1; y++) {
      io.out(Ansi.cursorTo(0, y));
      io.out('▒');
      io.out(Ansi.cursorTo(cols - 1, y));
      io.out('▒');
    }
  }

  async function printScore(causeOfDeath: string) {
    const highscore = await updateHighScore();
    const width =
      Math.max(body.length.toString().length, highscore.toString().length, causeOfDeath.length) + 3;
    io.out(Ansi.normalScreen);
    io.out(`┌─ You Died! ───────${padText('─', width, '─')}┐\n`);
    io.out(`│                   ${padText(' ', width)}│\n`);
    io.out(`│       Your Score: ${padText(getScore(), width)}│\n`);
    io.out(`│       High Score: ${padText(highscore, width)}│\n`);
    io.out(`│   Cause of Death: ${padText(causeOfDeath, width)}│\n`);
    io.out(`│                   ${padText(' ', width)}│\n`);
    io.out(`└───────────────────${padText('─', width, '─')}┘\n`);

    io.out(Ansi.italic + Ansi.faint);
    // io.out(`✨  Even when you make all the right choices,\n     things can still go wrong ✨\n`);
    io.out(`✨  The snake is a metaphor for life  ✨\n`);
    io.out(Ansi.reset);

    io.out(`\n`);
  }

  async function addKeyHandlers() {
    const up = () => {
      if (direction !== Direction.DOWN) nextDirection = Direction.UP;
    };
    const down = () => {
      if (direction !== Direction.UP) nextDirection = Direction.DOWN;
    };
    const left = () => {
      if (direction !== Direction.RIGHT) nextDirection = Direction.LEFT;
    };
    const right = () => {
      if (direction !== Direction.LEFT) nextDirection = Direction.RIGHT;
    };
    const exit = () => {
      cancelled = true;
    };

    const handler: { [key: string]: () => void } = {
      w: up,
      [Ansi.CURSOR_UP]: up,
      s: down,
      [Ansi.CURSOR_DOWN]: down,
      a: left,
      [Ansi.CURSOR_BACKWARDS]: left,
      d: right,
      [Ansi.CURSOR_FORWARD]: right,
      [Ascii.ETX]: exit,
      [Ascii.EOT]: exit,
      default: () => {}
    };

    io.proc.stdin.onWrite(data => {
      (handler[data] || handler.default)();
    });
  }

  // Setup
  io.out(Ansi.alternateScreen);
  io.out(Ansi.cursorHide);
  await printBoundary();
  await addKeyHandlers();

  // eslint-disable-next-line
  for (const i of Array(NUMBER_OF_FOODS)) {
    await placeFood();
  }

  // Main Loop
  while (true) {
    const head = await newHead(body[0]);

    const hitWall = head[0] > cols - 2 || head[0] < 1 || head[1] > rows - 3 || head[1] < 1;
    const ateYourself = await pairInList(head, body);

    if (hitWall || ateYourself || cancelled) {
      const causeOfDeath = (hitWall && 'Wall') || (ateYourself && 'Cannibalism') || 'Suicide';
      await printScore(causeOfDeath);
      return 0;
    }

    body.unshift(head);

    if (await pairInList(head, foods)) {
      await placeFood(head);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const tail = body.pop()!;
      io.out(Ansi.cursorTo(tail[0], tail[1]));
      io.out(' ');
    }

    io.out(Ansi.cursorHide);
    io.out(SNAKE_COLOR);
    io.out(Ansi.bold);
    io.out(Ansi.cursorTo(head[0], head[1]));
    io.out('@');
    io.out(Ansi.cursorTo(body[1][0], body[1][1]));
    io.out('o');

    io.out(Ansi.cursorTo(0, rows));
    io.out(Ansi.reset);
    io.out(`▒  `);
    io.out(Ansi.bold);
    io.out(`Score: ${getScore()}          `);

    io.out(Ansi.cursorTo(cols, rows));
    io.out(Ansi.cursorHide);

    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
