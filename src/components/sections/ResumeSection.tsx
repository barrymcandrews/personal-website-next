import React from 'react';
import { AnchorButton } from '../elements/Button/Button';

export default function ResumeSection() {
  return (
    <section className='text-center m-20'>
      <h3>Hi, I&apos;m Barry</h3>
      <p>I&apos;m a software engineer with a passion for technology.</p>
      <AnchorButton
        text='Download Resume'
        to={process.env.PUBLIC_URL + '/Barry_McAndrews_8-11-2022.pdf'}
      />
    </section>
  );
}
