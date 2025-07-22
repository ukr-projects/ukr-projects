// .github/scripts/generate-stats.js
const { writeFileSync } = require("fs");
const { graphql } = require("@octokit/graphql");

async function main() {
  const token = process.env.GITHUB_TOKEN;
  const username = "ukr-projects";
  const orgs = ["notebook-nexus", "uikraft-hub"];

  // helper to run GraphQL
  const gql = (query) =>
    graphql(query, { headers: { authorization: `token ${token}` } });

  // 1) Profile contributions
  const { viewer } = await gql(`
    {
      viewer {
        contributionsCollection {
          contributionCalendar { totalContributions }
        }
      }
    }
  `);
  const totalContribs = viewer.contributionsCollection.contributionCalendar.totalContributions;

  // 2) Issues closed by you
  const { issuesClosed } = await gql(`
    {
      issuesClosed: search(query: "type:issue state:closed closed-by:${username}", type: ISSUE) {
        issueCount
      }
    }
  `);

  // 3) Commits authored by you
  const { commits } = await gql(`
    {
      commits: search(query: "author:${username}", type: COMMIT) {
        commitCount
      }
    }
  `);

  // 4) Stars on your profile repos
  const { starred } = await gql(`
    {
      starred: search(query: "user:${username}", type: REPOSITORY) {
        repositoryCount
      }
    }
  `);

  // 5) Stars in each org
  let orgStars = 0;
  for (const org of orgs) {
    const data = await gql(`
      {
        org: organization(login: "${org}") {
          repos(first: 100) {
            nodes { stargazerCount }
          }
        }
      }
    `);
    orgStars += data.org.repos.nodes.reduce((s, r) => s + r.stargazerCount, 0);
  }

  const totalStars = starred.repositoryCount + orgStars;

  // create the badge JSON
  const badge = {
    schemaVersion: 1,
    label: "My Stats",
    message: `⭐${totalStars} | 📊${totalContribs} | ✅${issuesClosed.issueCount} | 📝${commits.commitCount}`
  };
  writeFileSync("stats/badge.json", JSON.stringify(badge, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
