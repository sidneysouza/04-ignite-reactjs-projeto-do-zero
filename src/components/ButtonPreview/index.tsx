import Link from 'next/link';
import styles from './styles.module.scss';

export function ButtonPreview(): JSX.Element {
  return (
    <aside>
      <Link href="/api/exit-preview">
        <a className={styles.buttonContainer}>Sair do modo Preview</a>
      </Link>
    </aside>
  );
}
