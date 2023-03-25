import React from 'react';
import classes from './Home.module.scss';
import barry from '../../public/images/barry.jpg';
import AboutMeSection from '../components/sections/AboutMeSection/AboutMeSection';
import CertificationSection from '../components/sections/CertificationSection/CertificationSection';
import MailSection from '../components/sections/MailSection';
import LinksSection from '../components/sections/LinksSection';
import ResumeSection from '../components/sections/ResumeSection';
import Image from 'next/image';

function Home() {
  return (
    <div className={classes.Home}>
      <div className={classes.container}>
        <header className={classes.header}>
          <div>
            <Image
              alt='Barry McAndrews'
              className={classes.image}
              height={130}
              src={barry}
              width={130}
            />
          </div>
          <div className={classes.headerText}>
            <h1>Barry</h1>
            <br />
            <h1>McAndrews</h1>
            <br />
            <h2 className={classes.subtitle}>Software Engineer</h2>
          </div>
        </header>

        <ResumeSection />

        <LinksSection />

        <AboutMeSection />

        {/*<ProjectsSection />*/}

        <CertificationSection />

        <MailSection />
      </div>
    </div>
  );
}

export default Home;
