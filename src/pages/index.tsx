/* eslint-disable jsx-a11y/accessible-emoji */
import { GetStaticProps } from 'next';
import Head from 'next/head';
// import { getPrismicClient } from '../services/prismic';

import Header from '../components/Header';

// import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home(): JSX.Element {
  return (
    <>
      <Head>
        <title>welcome | spacetraveling</title>
      </Head>

      <Header />

      <main className={styles.container}>
        <div className={styles.posts}>
          <a>
            <strong>Como utilizar Hooks</strong>
            <p>Pensando em sincronização em vez de ciclos de vida</p>
            <div className={styles.info}>
              <div>
                <span>📅</span>
                <time>15 Mar 2021</time>
              </div>
              <div>
                <span>👤</span>
                <span>Sidney Souza</span>
              </div>
            </div>
          </a>
          <a>
            <strong>Como utilizar Hooks</strong>
            <p>Pensando em sincronização em vez de ciclos de vida</p>
            <div className={styles.info}>
              <div>
                <span>📅</span>
                <time>15 Mar 2021</time>
              </div>
              <div>
                <span>👤</span>
                <span>Sidney Souza</span>
              </div>
            </div>
          </a>
          <a>
            <strong>Como utilizar Hooks</strong>
            <p>Pensando em sincronização em vez de ciclos de vida</p>
            <div className={styles.info}>
              <div>
                <span>📅</span>
                <time>15 Mar 2021</time>
              </div>
              <div>
                <span>👤</span>
                <span>Sidney Souza</span>
              </div>
            </div>
          </a>
          <a>
            <strong>Como utilizar Hooks</strong>
            <p>Pensando em sincronização em vez de ciclos de vida</p>
            <div className={styles.info}>
              <div>
                <span>📅</span>
                <time>15 Mar 2021</time>
              </div>
              <div>
                <span>👤</span>
                <span>Sidney Souza</span>
              </div>
            </div>
          </a>
          <a>
            <strong>Como utilizar Hooks</strong>
            <p>Pensando em sincronização em vez de ciclos de vida</p>
            <div className={styles.info}>
              <div>
                <span>📅</span>
                <time>15 Mar 2021</time>
              </div>
              <div>
                <span>👤</span>
                <span>Sidney Souza</span>
              </div>
            </div>
          </a>
        </div>
      </main>
    </>
  );
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);
//   // TODO
// };
