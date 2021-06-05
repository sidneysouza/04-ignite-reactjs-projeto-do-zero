import Link from 'next/link';

import styles from '../../styles/common.module.scss';
import header from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.container}>
      <div className={styles.content}>
        <div className={header.logo}>
          <Link href="/">
            <a>
              <img src="/images/logo.svg" alt="logo" />
            </a>
          </Link>
        </div>
      </div>
    </header>
  );
}
