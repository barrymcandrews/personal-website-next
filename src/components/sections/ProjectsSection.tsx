import React from 'react';
import Card from '../elements/Card/Card';
import classes from '../../pages/Home.module.scss';
import linkedin from '../../../public/images/linkedin.jpg';
import github from '../../../public/images/github.png';

export default function ProjectsSection() {
  return (
    <>
      <Card
        body='Find patterns in your skincare products'
        button={{
          text: 'See More',
          to: 'https://dev.dermsys.app'
        }}
        className={classes.section}
        image={linkedin}
        title='Dermsys'
      />

      <Card
        body='A Cloud-based chat app hosted in AWS'
        button={{
          text: 'Go to GitHub',
          to: 'https://github.com/barrymcandrews'
        }}
        image={github}
        title='Raven Messenger'
      />
    </>
  );
}
