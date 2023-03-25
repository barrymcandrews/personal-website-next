import React, { useEffect, useState } from 'react';
import ReactGA from 'react-ga4';
import { useRouter } from 'next/router';

export default function GoogleAnalytics() {
  const [enabled, setEnabled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_STAGE === 'prod' && !router.query.canary) {
      ReactGA.initialize('UA-73066517-1');
      setEnabled(true);
    }
  }, [router.query]);

  useEffect(() => {
    if (enabled) {
      ReactGA.send('pageview');
    }
  }, [router.pathname, enabled]);
  return <></>;
}
