import { graphql } from "@octokit/graphql";

export async function fetchGitHubData(owner, name, token) {
  const query = `
    query ($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
        pullRequests(last: 50, states: [OPEN,CLOSED]) {
          nodes {
            title
            author { login }
            createdAt
            url
            reviews(last: 10) {
              nodes {
                state
                author { login }
                createdAt
              }
            }
            commits(last: 1) {
              nodes {
                commit {
                  statusCheckRollup {
                    state
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await graphql(query, {
    owner,
    name,
    headers: {
      authorization: `token ${token}`,
    },
  });

  return data;
}
