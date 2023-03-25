interface EnvStore {
  [key: string]: string;
}

export class Environment {
  env: EnvStore = {
    PATH: '/usr/bin',
    HOME: '/home/barry',
    PWD: '/home/barry',
    USER: 'barry',
    TERM: 'xterm-256color'
  };

  copy(): Environment {
    return Object.create(this);
  }

  put(key: string, value: string) {
    this.env[key] = value;
  }

  get(key: string): string {
    return key in this.env ? this.env[key] : '';
  }

  getAll(): string[] {
    return Object.keys(this.env);
  }

  substitute(line: string): string {
    return line
      .split(' ')
      .map(word => {
        if (word.startsWith('$')) {
          const key = word.substring(1);
          return this.env[key];
        }
        return word;
      })
      .join(' ');
  }
}
