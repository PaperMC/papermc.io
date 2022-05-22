document.addEventListener('DOMContentLoaded', async () => {
    const data = await fetch("https://raw.githubusercontent.com/PaperMC/papermc.io/data/sponsors.json");
    const {ocData, ghData} = await data.json();
    const list = document.getElementById("sponsor-list");

    ocData.collective.contributors.nodes.forEach(node => {
        list.appendChild(createListEntry(clean(node.name), node.image));
    });
    ghData.organization.sponsors.nodes.forEach(node => {
        list.appendChild(createListEntry(clean(node.login), node.avatarUrl));
    });

    document.getElementById("oc-balance").innerText = '$' + (ocData.collective.stats.balance.valueInCents / 100);
    document.getElementById("oc-spending").innerText = '$' + (ocData.collective.stats.monthlySpending.valueInCents / 100);
});

function clean(name) {
    return name.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function createListEntry(name, image) {
    const li = document.createElement("li");
    li.innerHTML = `
            <img src='${image}' alt='${name}' title='${name}' onerror='this.src="https://opencollective.com/static/images/default-guest-logo.svg"'/>
        `;
    return li;
}

