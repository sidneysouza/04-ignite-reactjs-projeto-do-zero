/* eslint-disable jsx-a11y/accessible-emoji */
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';

import { useEffect, useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import Header from '../components/Header';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { ButtonPreview } from '../components/ButtonPreview';

interface Post {
  uid?: string;
  first_publication_date_formatted: string | null;
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
  preview: boolean;
}

export default function Home({
  postsPagination: { next_page, results },
  preview = true,
}: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextPage, setNextPage] = useState(next_page);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    setPosts(
      results.map(post => ({
        ...post,
        first_publication_date_formatted: format(
          new Date(post.first_publication_date),
          'dd MMM yyyy'
        ).toLocaleLowerCase(),
      }))
    );
  }, [results]);

  async function loadMorePostsButton(): Promise<void> {
    setIsLoadingMore(true);
    fetch(nextPage)
      .then(response => {
        response.json().then(data => {
          setNextPage(data.next_page);
          setPosts([
            ...posts,
            ...data.results.map(post => ({
              uid: post.uid,
              first_publication_date_formatted: format(
                new Date(post.first_publication_date),
                'dd MMM yyyy'
              ).toLocaleLowerCase(),
              first_publication_date: post.first_publication_date,
              data: {
                title: post.data.title,
                subtitle: post.data.subtitle,
                author: post.data.author,
              },
            })),
          ]);
        });
      })
      .catch(err => console.error('erro: ', err));
  }

  return (
    <>
      <Head>
        <title>Welcome | spacetraveling</title>
      </Head>

      <Header />

      <main className={commonStyles.container}>
        <div className={commonStyles.content}>
          <div className={styles.posts}>
            {posts.map((post, index) => (
              <Link key={String(index)} href={`post/${post.uid}`}>
                <a>
                  <strong>{post.data.title}</strong>
                  <p>{post.data.subtitle}</p>
                  <div className={styles.info}>
                    <div>
                      <span>
                        <FiCalendar size={20} />
                      </span>
                      <time>{post.first_publication_date_formatted}</time>
                    </div>
                    <div>
                      <span>
                        <FiUser size={20} />
                      </span>
                      <span>{post.data.author}</span>
                    </div>
                  </div>
                </a>
              </Link>
            ))}

            {nextPage && (
              <div className={styles.loadMore}>
                <button type="button" onClick={() => loadMorePostsButton()}>
                  {/* {isLoadingMore ? (
                    <div className={styles.spinner}>
                      <div />
                      <div />
                      <div />
                      <div />
                    </div>
                  ) : ( */}
                  Carregar mais posts
                  {/* )} */}
                </button>
              </div>
            )}
          </div>

          {preview && <ButtonPreview />}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      pageSize: 5,
      fetch: ['post.title'],
      orderings: '[document.first_publication_date desc]',
      ref: previewData?.ref ?? null,
    }
  );

  const posts = postsResponse.results.map(post => {
    const { uid, first_publication_date } = post;
    return {
      uid,
      first_publication_date,
      data: {
        author: post.data.author,
        subtitle: post.data.subtitle,
        title: post.data.title,
      },
    };
  });

  // console.log(postsResponse);

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      },
      preview,
    },
    revalidate: 60 * 30, // 30 minutes
  };
};
