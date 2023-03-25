import React from 'react';
import styles from './Button.module.scss';
import Link from 'next/link';

export interface ButtonProps {
  to: string;
  text: string;
}

export function AnchorButton(props: ButtonProps) {
  return (
    <a className={styles.btn} href={props.to} rel='noopener noreferrer' target='_blank'>
      {props.text}
    </a>
  );
}

export function LinkButton(props: ButtonProps) {
  return (
    <Link className={styles.btn} href={props.to}>
      {props.text}
    </Link>
  );
}
