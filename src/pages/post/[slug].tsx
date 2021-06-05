/* eslint-disable no-useless-escape */
/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import PrismicDOM from 'prismic-dom';

import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  readingTime: string;
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}
interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const first_publication_date_formatted = format(
    new Date(post.first_publication_date),
    'dd MMM yyyy'
  ).toLowerCase();

  const readingTime = `${Math.ceil(
    post.data.content
      .map(
        content =>
          `${content.heading} ${PrismicDOM.RichText.asText(content.body)}`
      )
      .join(', ')
      .replace(/[.,\/#!$%\^&\*;:{}=?\-_'()]/g, '')
      .replace(/\s{2,}/g, '')
      .split(' ').length / 200
  )} min`;

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>
      <Header />
      <article className={styles.post}>
        <figure className={styles.imageContainer}>
          <img src={post.data.banner.url} alt={post.data.title} />
        </figure>
        <div className={commonStyles.container}>
          <div className={commonStyles.content}>
            <header>
              <h1 className={styles.title}>{post.data.title}</h1>
              <section className={styles.postInfo}>
                <ul>
                  <li>
                    <FiCalendar size={20} />
                    <time>{first_publication_date_formatted}</time>
                  </li>
                  <li>
                    <FiUser size={20} />
                    <span>{post.data.author}</span>
                  </li>
                  <li>
                    <FiClock size={20} />
                    <span>{readingTime}</span>
                  </li>
                </ul>
              </section>
            </header>
            <main>
              <div>
                <h1>{post.data.content[0]?.heading}</h1>
                <div
                  dangerouslySetInnerHTML={{
                    __html: PrismicDOM.RichText.asHtml(
                      post.data.content[0]?.body
                    ),
                  }}
                />
              </div>
              <div>
                <h1>{post.data.content[1]?.heading}</h1>
                <div
                  dangerouslySetInnerHTML={{
                    __html: PrismicDOM.RichText.asHtml(
                      post.data.content[1]?.body
                    ),
                  }}
                />
              </div>
            </main>
          </div>
        </div>
      </article>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const lastFivePosts = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      pageSize: 5,
      fetch: ['post.title'],
      orderings: '[document.first_publication_date desc]',
    }
  );
  return {
    paths:
      lastFivePosts.results.map(post => ({ params: { slug: post.uid } })) || [],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params: { slug } }) => {
  const prismic = getPrismicClient();
  const responsePost = await prismic.getByUID('posts', String(slug), {});

  if (!responsePost) {
    return {
      notFound: true,
    };
  }
  return {
    props: { post: { ...responsePost } },
    revalidate: 1, // 1 second
  };
};
