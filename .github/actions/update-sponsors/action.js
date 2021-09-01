const core = require('@actions/core');
const fs = require('fs');
const axios = require('axios');

main();

async function main() {
    const [ocData, ghData] = await Promise.all([opencollective(), github()]);
    console.log(`Found ${ocData.collective.contributors.totalCount} OC Sponsors and ${ghData.organization.sponsors.totalCount} GH Sponsors`);
    fs.writeFileSync('sponsors.json', JSON.stringify({ocData, ghData}));
    console.log('Saved');
}

async function opencollective() {
    // language=GraphQL
    const query = `{
        collective(slug: "papermc") {
            name
            slug
            stats {
                balance {
                    valueInCents
                }
                monthlySpending {
                    valueInCents
                }
            }
            contributors(roles: BACKER) {
                totalCount
                nodes {
                    name
                    image
                }
            }
        }
    }`;
    const result = await graphQL('https://api.opencollective.com/graphql/v2', query);
    return result.data;
}

async function github() {
    // language=GraphQL
    const query = `{
        organization(login: "papermc") {
            sponsors(first: 100) {
                totalCount
                nodes {
                    ... on Actor {
                        login
                        avatarUrl
                    }
                }
            }
        }
    }`;
    const apiKey = core.getInput("repo-token", {required: true});
    const result = await graphQL('https://api.github.com/graphql', query, 'Bearer ' + apiKey); // dummy account with no perms
    return result.data;
}

async function graphQL(url, query, auth) {
    const result = await axios.post(url, {query}, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': auth ? auth : ''
        }
    });
    return result.data;
}
