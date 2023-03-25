import { Octokit } from '@octokit/core';

const octokit = new Octokit({
  auth: atob('Z2hwX1FXZVJOZjd2UXd4YVhrQThOdVJCRGZlYmViVXVtUDFEYkc4eQ')
});

export default octokit;
