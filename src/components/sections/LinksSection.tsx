import React from 'react';
import Card from '../elements/Card/Card';
import classes from '../../pages/Home.module.scss';
import linkedin from '../../../public/images/linkedin.jpg';
import github from '../../../public/images/github.png';

export default function LinksSection() {
  return (
    <>
      <Card
        body='For more information about me check out my
                    LinkedIn page. There you can find my most
                    up-to-date employment information. Feel free
                    to send me a message!'
        button={{
          text: 'Go to LinkedIn',
          to: 'https://www.linkedin.com/in/barry-mcandrews/'
        }}
        className={classes.section}
        code='$ open https://www.linkedin.com/in/barry-mcandrews/'
        image={linkedin}
        title='LinkedIn'
      />

      <Card
        body={
          <>
            Most of my personal projects are hosted on GitHub. Check out my favorite project,{' '}
            <a href='https://github.com/barrymcandrews/aurora-server'>Aurora Server</a>, which I
            created to enhance my house’s LED lights.
          </>
        }
        button={{
          text: 'Go to GitHub',
          to: 'https://github.com/barrymcandrews'
        }}
        code='$ open https://github.com/barrymcandrews'
        image={github}
        title='GitHub'
      />
    </>
  );
}
