// .github/scripts/generate-stats.js
import { writeFileSync } from "fs";
import { graphql } from "@octokit/graphql";

async function main() {
  const token = process.env.GITHUB_TOKEN;
  const username = "ukr-projects";
  const orgs = ["notebook-nexus", "uikraft-hub"];  // add more orgs here

  const gql = (query) => graphql(query, { headers: { authorization: `token ${token}` } });

  // 1) Profile contributions count
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

  // 2) Issues opened by you
  const { issues } = await gql(`
    {
      issues: search(query: "author:${username} type:issue", type: ISSUE) {
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

  // 4) Stars across your profile
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
            pageInfo { hasNextPage endCursor }
          }
        }
      }
    `);
    // sum the first 100 repos’ stars; add pagination if >100.
    orgStars += data.org.repos.nodes.reduce((s, r) => s + r.stargazerCount, 0);
  }

  const totalStars = starred.repositoryCount + orgStars;

  // emit JSON for Shields
  const badge = {
    schemaVersion: 1,
    label: "My Stats",
    message: `⭐${totalStars} | 📊${totalContribs} | 🐛${issues.issueCount} | 📝${commits.commitCount}`,
  };
  writeFileSync("stats/badge.json", JSON.stringify(badge, null, 2));
}

main();
