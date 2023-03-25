const ESC = '\u001B';
const CSI = ESC + '[';
const OSC = '\u001B]';
const SEP = ';';
const BEL = '\u0007';

export const CURSOR_UP = CSI + 'A';
export const CURSOR_DOWN = CSI + 'B';
export const CURSOR_FORWARD = CSI + 'C';
export const CURSOR_BACKWARDS = CSI + 'D';

export const cursorUp = (count = 1) => CSI + count + 'A';
export const cursorDown = (count = 1) => CSI + count + 'B';
export const cursorForward = (count = 1) => CSI + count + 'C';
export const cursorBackward = (count = 1) => CSI + count + 'D';

export const cursorLeft = CSI + 'G';
export const cursorSavePosition = CSI + 's';
export const cursorRestorePosition = CSI + 'u';
export const cursorGetPosition = CSI + '6n';
export const cursorNextLine = CSI + 'E';
export const cursorPrevLine = CSI + 'F';
export const cursorHide = CSI + '?25l';
export const cursorShow = CSI + '?25h';

export const eraseEndLine = CSI + 'K';
export const eraseStartLine = CSI + '1K';
export const eraseLine = CSI + '2K';

export const eraseDown = CSI + 'J';
export const eraseUp = CSI + '1J';
export const eraseScreen = CSI + '2J';
export const scrollUp = CSI + 'S';
export const scrollDown = CSI + 'T';

export const clearScreen = '\u001Bc\n';
export const clearTerminal = `${eraseScreen}${CSI}3J${CSI}H`;

export const beep = BEL;

export const alternateScreen = CSI + '?1049h';
export const normalScreen = CSI + '?1049l';

export const reset = CSI + '0m';
export const bold = CSI + '1m';
export const faint = CSI + '2m';
export const italic = CSI + '3m';

export function cursorTo(x: any, y: any) {
  if (typeof x !== 'number') {
    throw new TypeError('The `x` argument is required');
  }

  if (typeof y !== 'number') {
    return CSI + (x + 1) + 'G';
  }

  return CSI + (y + 1) + ';' + (x + 1) + 'H';
}

export function cursorMove(x: any, y: any) {
  if (typeof x !== 'number') {
    throw new TypeError('The `x` argument is required');
  }

  let ret = '';

  if (x < 0) {
    ret += CSI + -x + 'D';
  } else if (x > 0) {
    ret += CSI + x + 'C';
  }

  if (y < 0) {
    ret += CSI + -y + 'A';
  } else if (y > 0) {
    ret += CSI + y + 'B';
  }

  return ret;
}

export function eraseLines(count: number) {
  let clear = '';

  for (let i = 0; i < count; i++) {
    clear += eraseLine + (i < count - 1 ? cursorUp() : '');
  }

  if (count) {
    clear += cursorLeft;
  }

  return clear;
}

export function link(url: string, text?: string) {
  if (!text) {
    text = url;
  }
  return [OSC, '8', SEP, SEP, url, BEL, text, OSC, '8', SEP, SEP, BEL].join('');
}
