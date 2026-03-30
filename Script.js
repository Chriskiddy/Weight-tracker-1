let myChart;
let people = JSON.parse(localStorage.getItem('wPeople')) || ["Kevin", "Mohan", "Chris", "Sedhu"];
let weights = JSON.parse(localStorage.getItem('wData')) || [];

window.onload = () => { renderAll(); };

function addPerson() {
    const name = document.getElementById('newName').value;
    if (!name) return;
    people.push(name);
    localStorage.setItem('wPeople', JSON.stringify(people));
    document.getElementById('newName').value = '';
    renderAll();
}

function addEntry() {
    const date = document.getElementById('dateInput').value;
    if (!date) return alert("Select a date");
    
    const entry = { id: Date.now(), date: date, vals: {} };
    people.forEach(p => {
        entry.vals[p] = document.getElementById(`in-${p}`).value || 0;
    });

    weights.push(entry);
    weights.sort((a, b) => new Date(a.date) - new Date(b.date));
    localStorage.setItem('wData', JSON.stringify(weights));
    renderAll();
}

function deleteEntry(id) {
    weights = weights.filter(w => w.id !== id);
    localStorage.setItem('wData', JSON.stringify(weights));
    renderAll();
}

function renderAll() {
    // Render Inputs
    const inputDiv = document.getElementById('dynamicInputs');
    inputDiv.innerHTML = people.map(p => `<div><label style="font-size:10px; font-weight:bold">${p}</label><input type="number" id="in-${p}" placeholder="0.0"></div>`).join('');

    // Render Table Header
    const header = document.getElementById('tableHeader');
    header.innerHTML = `<th>Date</th>` + people.map(p => `<th>${p.slice(0,3)}</th>`).join('') + `<th>Action</th>`;

    // Render Table Body
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = weights.map(w => `
        <tr>
            <td>${w.date}</td>
            ${people.map(p => `<td>${w.vals[p] || 0}</td>`).join('')}
            <td><button class="del-btn" onclick="deleteEntry(${w.id})">Del</button></td>
        </tr>
    `).join('');

    renderChart();
}

function renderChart() {
    const ctx = document.getElementById('weightChart').getContext('2d');
    if (myChart) myChart.destroy();
    
    const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#8E44AD', '#F39C12'];
    
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: weights.map(w => w.date),
            datasets: people.map((p, i) => ({
                label: p,
                data: weights.map(w => w.vals[p] || 0),
                borderColor: colors[i % colors.length],
                fill: false,
                tension: 0.3
            }))
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function clearAll() {
    if(confirm("Delete everything?")) {
        localStorage.clear();
        location.reload();
    }
}
