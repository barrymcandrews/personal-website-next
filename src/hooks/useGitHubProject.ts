import { useQuery } from 'react-query';
import { Endpoints } from '@octokit/types';
import octokit from './octokit';

type ProjectResponse = Endpoints['GET /repos/{owner}/{repo}']['response'];

const getProject = async (repo: string) => {
  const response: ProjectResponse = await octokit.request('GET /repos/{owner}/{repo}', {
    owner: 'barrymcandrews',
    repo
  });
  return response.data;
};

export default function useGitHubProject(projectName: string) {
  return useQuery(['projects', projectName], () => getProject(projectName), {
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchOnReconnect: false
  });
}
