import React from 'react';
import classes from './Footer.module.scss';
import dynamic from 'next/dynamic';

const Terminal = dynamic(() => import('../Terminal/Terminal'), { ssr: false });

export default function Footer() {
  return (
    <section className={classes.bgDark}>
      <div className={classes.container}>
        <div className={classes.m20}>
          <Terminal />
        </div>
      </div>
    </section>
  );
}
