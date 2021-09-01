const core = require('@actions/core');
const fs = require('fs');
const axios = require('axios');

main();

async function main() {
    const root = '/home/runner/work/papermc.io/papermc.io/work/';
    const [ocData, ghData] = await Promise.all([opencollective(), github()]);
    console.log(`Found ${ocData.collective.contributors.totalCount} OC Sponsors and ${ghData.organization.sponsors.totalCount} GH Sponsors`);
    fs.writeFileSync(root + 'sponsors.json', JSON.stringify({ocData, ghData}));

    let listEntries = "";
    let count = 0;
    ocData.collective.contributors.nodes.forEach(node => {
        listEntries += createListEntry(node.name, node.image);
        count++;
    });
    ghData.organization.sponsors.nodes.forEach(node => {
        listEntries += createListEntry(node.login, node.avatarUrl.replace("&v=4", ""));
        count++;
    });

    const height = Math.ceil(count / 6.0) * 80 + 32
    const svg = `<svg width="500" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <foreignObject width="500" height="${height}">
            <div xmlns="http://www.w3.org/1999/xhtml">
                <ul>
                    ${listEntries}
                </ul>
            </div>
        </foreignObject>
    </svg>`;
    fs.writeFileSync(root + 'sponsors.svg', svg);

    console.log('Saved');
}

function createListEntry(name, image) {
    return `<li style="display: inline"><img src='${image}' alt='${name}' title='${name}' onerror='this.src="https://opencollective.com/static/images/default-guest-logo.svg"' style="height: 64px;width: 64px;margin: 5px;border-radius: 15px;box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);"/></li>`;
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
    const result = await graphQL('https://api.github.com/graphql', query, 'Bearer ' + apiKey);
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
