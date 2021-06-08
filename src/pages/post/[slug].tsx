/* eslint-disable react/no-danger */
/* eslint-disable no-useless-escape */
import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { format, isEqual } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { zonedTimeToUtc } from 'date-fns-tz';
import PrismicDOM from 'prismic-dom';

import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { url } from 'inspector';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { Comments } from '../../components/Comments';
import { ButtonPreview } from '../../components/ButtonPreview';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  last_publication_date: string | null;
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
  prevPost: Post;
  nextPost: Post;
  preview: boolean;
}

export default function Post({
  post,
  prevPost,
  nextPost,
  preview = true,
}: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const first_publication_date_formatted = format(
    new Date(post?.first_publication_date || new Date()),
    'dd MMM yyyy',
    {
      locale: ptBR,
    }
  ).toLowerCase();
  const last_publication_date_formatted = isEqual(
    new Date(post.first_publication_date || null),
    new Date(post.last_publication_date || null)
  )
    ? null
    : format(
        zonedTimeToUtc(
          new Date(post.last_publication_date || null),
          'America/Cuiaba'
        ),
        "'* editado em' dd MMM yyyy', às' HH:mm",
        {
          locale: ptBR,
        }
      ).toLowerCase();

  const calcReadingTime = Math.ceil(
    post.data.content
      .map(content => {
        return `${content.heading} ${PrismicDOM.RichText.asText(content.body)}`;
      })
      .join(', ')
      .replace(/[.,\/#!$%\^&\*;:{}=?\-_'()]/g, '')
      .replace(/\s{2,}/g, '')
      .split(' ').length / 200
  );
  const readingTime = `${String(calcReadingTime)} min`;

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>
      <Header />
      <article className={styles.post}>
        <figure
          className={styles.imageContainer}
          style={{ backgroundImage: `url("${post.data.banner.url}")` }}
        >
          {/* <img src={post.data.banner.url} alt={post.data.title} /> */}
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
                {last_publication_date_formatted && (
                  <span>{last_publication_date_formatted}</span>
                )}
              </section>
            </header>
            <main>
              <div>
                <h1>{post.data.content[0]?.heading}</h1>
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      post.data.content[0].body &&
                      PrismicDOM.RichText.asHtml(post.data.content[0]?.body),
                  }}
                />
              </div>
              <div>
                <h1>{post.data.content[1]?.heading}</h1>
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      post.data.content[1]?.body &&
                      PrismicDOM.RichText.asHtml(post.data.content[1]?.body),
                  }}
                />
              </div>
            </main>
          </div>
        </div>
      </article>

      <div className={commonStyles.container}>
        <div className={commonStyles.content}>
          <aside className={styles.sectionPrevNext}>
            <div className={styles.containerPrevNext}>
              {prevPost.uid ? (
                <Link href={prevPost.uid}>
                  <a>
                    <span>{prevPost.data?.title}</span>
                    <span>Post anterior</span>
                  </a>
                </Link>
              ) : (
                <div />
              )}
              {nextPost.uid ? (
                <Link href={nextPost.uid}>
                  <a>
                    <span>{nextPost.data?.title}</span>
                    <span>Próximo post</span>
                  </a>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </aside>

          <Comments />

          {preview && <ButtonPreview />}
        </div>
      </div>
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

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
  params: { slug },
}) => {
  const prismic = getPrismicClient();
  const responsePost = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  if (!responsePost) {
    return {
      notFound: true,
    };
  }

  const prevPostResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      after: responsePost.id,
      orderings: '[document.first_publication_date desc]',
      fetch: ['posts.uid', 'posts.title'],
      ref: previewData?.ref ?? null,
    }
  );

  const nextPostResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      after: responsePost.id,
      orderings: '[document.first_publication_date]',
      fetch: ['posts.uid', 'posts.title'],
      ref: previewData?.ref ?? null,
    }
  );

  return {
    props: {
      post: { ...responsePost },
      prevPost: { ...prevPostResponse.results[0] },
      nextPost: { ...nextPostResponse.results[0] },
      preview,
    },
    revalidate: 1, // 1 second
  };
};
