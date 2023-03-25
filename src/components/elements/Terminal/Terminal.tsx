import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import 'xterm/css/xterm.css';
import styles from './Terminal.module.scss';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import * as Ascii from '../../../shell/Ascii';
import { init } from '../../../shell/proc';

export default class Terminal extends Component {
  fitAddon = new FitAddon();

  webLinksAddon = new WebLinksAddon();

  term = new XTerm({
    cursorBlink: true,
    fontFamily: `"Source Code Pro", monospace`,
    fontWeight: '500',
    convertEol: true,
    fontSize: 12,
    rendererType: 'dom',
    bellStyle: 'sound',
    theme: {
      background: '#212121',
      cursorAccent: '#212121',
      foreground: '#9D9D9D',
      cursor: '#9D9D9D'
    }
  });

  componentDidMount() {
    // eslint-disable-next-line react/no-find-dom-node
    const terminalContainer = findDOMNode(this) as HTMLElement;
    this.term.loadAddon(this.fitAddon);
    this.term.loadAddon(this.webLinksAddon);
    this.term.open(terminalContainer);
    this.fitAddon.fit();

    this.connectShell().catch(() => {
      // Include a backup message in case an error makes it to prod
      this.term.write('$ cat copyright.txt\r\n');
      this.term.write('Made by Barry McAndrews © ' + new Date().getFullYear() + '\n\n');
    });
  }

  componentWillUnmount() {
    this.term.dispose();
    window.removeEventListener('resize', () => this.fitAddon.fit());
  }

  render() {
    return <div className={styles.terminalContainer} id='terminal-container' />;
  }

  private async connectShell(sendCopyrightCommand = true) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const shell = init(['sh', '--login', '-i'])!;

    shell.env.put('ROWS', this.term.rows.toString());
    shell.env.put('COLS', this.term.cols.toString());

    // Connect shell to terminal
    this.term.onData(d => shell.stdin.write(d));
    shell.stdout.onWrite(d => this.term.write(d));

    window.addEventListener('resize', () => {
      this.fitAddon.fit();
      shell.env.put('ROWS', this.term.rows.toString());
      shell.env.put('COLS', this.term.cols.toString());
    });
    shell.start();
    if (sendCopyrightCommand) {
      const command = 'cat copyright.txt' + Ascii.CR;
      command.split('').forEach(char => shell.stdin.write(char));
    }

    await shell.wait();
    await this.connectShell(false);
  }
}
