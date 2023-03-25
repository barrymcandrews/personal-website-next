import React from 'react';
import styles from './Navbar.module.scss';
import Link from 'next/link';

export function Navbar() {
  return (
    <div className={styles.bar}>
      <Link className={styles.barTitle} href='/'>
        Barry
        <br />
        McAndrews
      </Link>
      <span className={styles.separator}>|</span>
      <Link className={styles.barItem} href='/'>
        Home
      </Link>
      {/*<Link className={styles.barItem} to="/">Portfolio</Link>*/}
      {/*<Link className={styles.barItem} to="/">About</Link>*/}
    </div>
  );
}
