import styles from './styles.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.container}>
      <div className={styles.content}>
        <img src="/images/logo.svg" alt="spacetraveling" />
      </div>
    </header>
  );
}
