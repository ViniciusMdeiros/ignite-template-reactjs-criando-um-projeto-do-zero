import { GetStaticPaths, GetStaticProps } from 'next';
import { ReactElement } from 'react';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/router';

import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';
import Header from '../../components/Header';

interface Post {
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

export default function Post({ post }: PostProps): ReactElement {
  const { isFallback } = useRouter();

  if (isFallback) {
    return <p>Carregando...</p>;
  }
  function timeEstimed(): number {
    const separation = post?.data.content.map(result => {
      const breakpoint = ' ';
      const { heading } = result;
      const separationText = heading.split(breakpoint);
      const sizeHeading = separationText.length;

      const body = result.body.map(results => {
        const { text } = results;
        const separationText2 = text.split(breakpoint);
        return separationText2.length;
      });

      const initial = 0;
      const sizeBody = body.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        initial
      );
      return { sizeHeading, sizeBody };
    });

    const initialValue = 0;
    const sumCharactersHeading = separation?.reduce(
      (accumulator, currentValue) => accumulator + currentValue.sizeHeading,
      initialValue
    );

    const sumCharactersBody = separation?.reduce(
      (accumulator, currentValue) => accumulator + currentValue.sizeBody,
      initialValue
    );

    const sumCharacters = (sumCharactersHeading + sumCharactersBody) / 200;

    return Math.round(sumCharacters);
  }

  return (
    <>
      <Header />
      <main className={styles.container}>
        <img src={post?.data.banner.url} alt="banner" />
        <article className={styles.post}>
          <h1>{post?.data.title}</h1>
          <div className={styles.divHeader}>
            <h2>
              <FiCalendar />
            </h2>
            <span>
              {format(parseISO(post?.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              }).toString()}
            </span>
            <h3>
              <FiUser />
            </h3>
            <h4>{post?.data.author}</h4>
            <h3>
              <FiClock />
            </h3>
            <h4>{timeEstimed()} min</h4>
          </div>
          {post?.data.content.map(({ heading, body }) => (
            <div className={styles.postContent}>
              <h5>{heading}</h5>
              {body.map(results => (
                <p>{results.text}</p>
              ))}
            </div>
          ))}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts', {
    lang: 'pt-BR',
  });

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
    },
    redirect: 60 * 30, // 30 minutos
  };
};
