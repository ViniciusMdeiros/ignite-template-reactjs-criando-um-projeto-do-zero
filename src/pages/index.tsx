import { GetStaticProps } from 'next';
import Link from 'next/link';
import { ReactElement, useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { getPrismicClient } from '../services/prismic';

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
  // next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({
  // next_page,
  results,
}: PostPagination): ReactElement<HomeProps> {
  const [visiblePosts, setVisiblePosts] = useState(2);

  return (
    <>
      <main className={styles.container}>
        <img src="/logo.svg" alt="logo" />
        <div className={styles.posts}>
          {results?.slice(0, visiblePosts).map(posts => (
            <Link legacyBehavior href={`/post/${posts.uid}`}>
              <a key={posts.uid}>
                <strong>{posts.data.title}</strong>
                <h1>{posts.data.subtitle}</h1>
                <div>
                  <h4>
                    <FiCalendar />
                  </h4>
                  <time>{posts.first_publication_date}</time>
                  <h5>
                    <FiUser />
                  </h5>
                  <h3>{posts.data.author}</h3>
                </div>
              </a>
            </Link>
          ))}
          {results.length > visiblePosts ? (
            <button
              onClick={() => setVisiblePosts(visiblePosts + 2)}
              type="button"
            >
              Carregar mais posts
            </button>
          ) : null}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postPagination = await prismic.getByType('posts', {
    orderings: [{ field: 'posts.first_publication_date', direction: 'desc' }],
  });

  const results = postPagination.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        { locale: ptBR }
      ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      results,
    },
  };
};
