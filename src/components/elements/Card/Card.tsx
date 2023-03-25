import React from 'react';
import classes from './Card.module.scss';
import { ButtonProps } from '../Button/Button';
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

export interface CardProps {
  className?: string;
  title?: string;
  body?: JSX.Element | string;
  code?: string;
  image: string | StaticImageData;
  button: ButtonProps;
}

export default function Card(props: CardProps) {
  const router = useRouter();
  const handleClick = () => router.push(props.button.to);
  return (
    <div
      className={classes.globalLink}
      role='button'
      style={{ cursor: 'pointer' }}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={event => {
        if (event.key === 'Enter') {
          handleClick();
        }
      }}
    >
      <section className={classes.Card + ' ' + props.className}>
        <div className={classes.imageContainer}>
          <Image alt='LinkedIn Logo' height={100} src={props.image} width={100} />
        </div>
        <div className={classes.content}>
          <code>{props.code}</code>
          <h4>{props.title}</h4>
          <div className={classes.cardText}>{props.body}</div>
        </div>
        <div className={classes.button}>
          <Link className={classes.cardLink} href={props.button.to} target='_blank'>
            {props.button.text} ›
          </Link>
        </div>
      </section>
    </div>
  );
}
