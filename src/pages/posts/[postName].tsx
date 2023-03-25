import React from 'react';
import Markdown from 'markdown-to-jsx';
import Error from '../../components/elements/Error/Error';
import { Navbar } from '../../components/elements/Navbar/Navbar';
import classes from '../posts/Blog.module.scss';
import { useRouter } from 'next/router';
import { QueryClient, QueryClientProvider } from 'react-query';
import usePost from '../../hooks/usePost';

interface BlogParams extends Record<string, string> {
  postName: string;
}

const queryClient = new QueryClient();

function BlogPage() {
  const router = useRouter();
  const { postName } = router.query as BlogParams;
  const { isLoading, error, data: post } = usePost(postName);
  const { metadata, content } = post || {};

  const Blockquote = (props: any) => {
    return (
      <div className={classes.blockquoteWrapper}>
        <blockquote>{props.children}</blockquote>
      </div>
    );
  };

  return (
    <>
      {error && <Error />}
      {isLoading && (
        <>
          <Navbar /> <div style={{ height: '100vh' }} />
        </>
      )}
      {content && (
        <div className={classes.Blog}>
          <Navbar />
          <div className={classes.container}>
            <div className='m-20'>
              {metadata && <h1>{metadata.title}</h1>}
              <Markdown
                options={{
                  overrides: {
                    blockquote: {
                      component: Blockquote
                    }
                  }
                }}
              >
                {content}
              </Markdown>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Blog() {
  return (
    <QueryClientProvider client={queryClient}>
      {' '}
      <BlogPage />
    </QueryClientProvider>
  );
}
