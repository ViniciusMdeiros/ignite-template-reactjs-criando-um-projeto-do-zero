import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { format } from 'date-fns';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
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

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export default function Home({ postsPagination }: HomeProps) {
  const [post, setPost] = useState(postsPagination?.results);
  const handleLoadMore = async (): Promise<boolean> => {
    const response = await fetch(postsPagination?.next_page);
    const data = await response.json();

    setPost([...post, ...data.results]);
    return true;
  };

  // if (postsPagination?.next_page === null) {
  return (
    <>
      <Head>
        <img src="/Logo.svg" alt="logo" />
      </Head>
      <main className={styles.main}>
        <div>
          {postsPagination?.results.map(posts => (
            <Link legacyBehavior href={`/post/${posts.uid}`}>
              <a key={posts.uid}>
                <title>{posts.data.title}</title>
                <h1>{posts.data.subtitle}</h1>
                <time>{posts.first_publication_date}</time>
                <h3>{posts.data.author}</h3>
              </a>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
  // }
  // return (
  //   <>
  //     <Head>
  //       <img src="/Logo.svg" alt="logo" />
  //     </Head>
  //     <main>
  //       <div>
  //         {postsPagination?.results.map(posts => (
  //           <Link legacyBehavior href={`/post/${posts.uid}`}>
  //             <a key={posts.uid}>
  //               <title>{posts.data.title}</title>
  //               <h1>{posts.data.subtitle}</h1>
  //               <time>{posts.first_publication_date}</time>
  //               <h3>{posts.data.author}</h3>
  //             </a>
  //           </Link>
  //         ))}
  //         <button onClick={handleLoadMore} type="button">
  //           Carregar mais posts
  //         </button>
  //       </div>
  //     </main>
  //   </>
  // );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', {
    orderings: [{ field: 'posts.first_publication_date', direction: 'desc' }],
  });
  console.log(postsResponse);
  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd/MM/yyyy'
      ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });
  console.log(posts);

  return {
    props: {
      posts,
    },
  };
};
