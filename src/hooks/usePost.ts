import { useQuery } from 'react-query';
import yaml from 'js-yaml';

export interface PostMetadata extends Record<string, string | undefined> {
  title: string;
  date?: string;
}
export interface Post {
  content: string; // the post content in markdown
  metadata: PostMetadata;
}

// uses the fetch api to get the post from /posts/:postName
const getPost = async (postName: string) => {
  const response = await fetch(`/md/${postName}.md`);
  if (!response.ok) {
    throw new Error('Failed to fetch post');
  }

  const rawString = await response.text();

  // parse the post metadata
  const [, metaString, mdString] = rawString.split('---', 3);
  const metadata = yaml.load(metaString) as PostMetadata;

  return {
    content: mdString,
    metadata
  };
};

export default function usePost(postName: string) {
  return useQuery<Post>(['post', postName], () => getPost(postName), {
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchOnReconnect: false,
    enabled: !!postName
  });
}
