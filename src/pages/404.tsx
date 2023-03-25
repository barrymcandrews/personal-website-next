import React from 'react';
import styles from '../components/elements/Error/Error.module.scss';
import { LinkButton } from '../components/elements/Button/Button';

export default function NotFoundPage() {
  return (
    <div className={styles.container}>
      <div>
        <header>
          <code className={styles.trace}>
            [&lt;ffffffff8102abeb&gt;] mce_panic.part.14+0x18b/0x1c0
            <br />
            [&lt;ffffffff8102ac80&gt;] mcc_panic+0x60/0xb0
            <br />
            [&lt;ffffffff8102aec4&gt;] mce_reign+0x1f4/0x200
            <br />
            [&lt;ffffffff8102b175&gt;] mce_end+0xf5/0x100
            <br />
            [&lt;ffffffff8102b92c&gt;] do_machine_check+0x3fc/0x600
            <br />
            [&lt;ffffffff8136d48f&gt;] ? intel_idle+0xbf/0x150
            <br />
            [&lt;ffffffff8165d78c&gt;] machine_check+0x1c/0x30
            <br />
            [&lt;ffffffff8136d48f&gt;] ? intel_idle+0xbf/0x150
            <br />
            &lt;&lt;EOE&gt;&gt; [&lt;ffffffff81509697&gt;] ? menu_select+0xe7/0x2c0
            <br />
            [&lt;ffffffff8101322a&gt;] cpu_idle+0xca/0x120
            <br />
            [&lt;ffffffff8163aa9a&gt;] start_secondary+0xd9/0xdb
            <br />
            Kernel panic - Error 404
            <br />
          </code>
          <h1 className={styles.main}>Page not found.</h1>
        </header>

        <section className='text-center m-20'>
          <LinkButton text='Go Home' to='/' />
        </section>
      </div>
    </div>
  );
}
