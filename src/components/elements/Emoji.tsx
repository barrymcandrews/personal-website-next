import React from 'react';

export interface EmojiProps {
  label: string;
  symbol: string;
}

export default function Emoji(props: EmojiProps) {
  return (
    <span
      aria-hidden={props.label ? 'false' : 'true'}
      aria-label={props.label ? props.label : ''}
      role='img'
    >
      {props.symbol}
    </span>
  );
}
