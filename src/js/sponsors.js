document.addEventListener('DOMContentLoaded', async () => {
    const {ocData, ghData} = await (await fetch("https://raw.githubusercontent.com/PaperMC/papermc.io/data/data.json")).json();
    const list = document.getElementById("sponsor-list");

    ocData.collective.contributors.nodes.forEach(node => {
        list.appendChild(createListEntry(node.name, node.image));
    });
    ghData.organization.sponsors.nodes.forEach(node => {
        list.appendChild(createListEntry(node.login, node.avatarUrl));
    });

    document.getElementById("oc-balance").innerText = '$' + (ocData.collective.stats.balance.valueInCents / 100);
    document.getElementById("oc-spending").innerText = '$' + (ocData.collective.stats.monthlySpending.valueInCents / 100);
});

function createListEntry(name, image) {
    const li = document.createElement("li");
    li.innerHTML = `
            <img src='${image}' alt='${name}' title='${name}' onerror='this.src="https://opencollective.com/static/images/default-guest-logo.svg"'/>
        `;
    return li;
}

