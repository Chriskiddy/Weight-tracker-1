let chart;
let people = JSON.parse(localStorage.getItem('pList')) || ["Kevin", "Mohan", "Chris", "Sedhu"];
let logs = JSON.parse(localStorage.getItem('wLogs')) || [];

window.onload = () => { render(); };

function addPerson() {
    const name = document.getElementById('newName').value.trim();
    if (name) {
        people.push(name);
        localStorage.setItem('pList', JSON.stringify(people));
        document.getElementById('newName').value = '';
        render();
    }
}

function addEntry() {
    const date = document.getElementById('dateInput').value;
    const note = document.getElementById('commentInput').value;
    if (!date) return alert("Please select a date");

    const entry = { id: Date.now(), date: date, note: note, weights: {} };
    people.forEach(p => {
        entry.weights[p] = document.getElementById(`in-${p}`).value || "0";
    });

    logs.push(entry);
    logs.sort((a, b) => new Date(a.date) - new Date(b.date));
    localStorage.setItem('wLogs', JSON.stringify(logs));
    document.getElementById('commentInput').value = '';
    render();
}

function editValue(logId, person, newVal) {
    const log = logs.find(l => l.id === logId);
    if (log) {
        log.weights[person] = newVal;
        localStorage.setItem('wLogs', JSON.stringify(logs));
        renderChart();
    }
}

function deleteRow(id) {
    logs = logs.filter(l => l.id !== id);
    localStorage.setItem('wLogs', JSON.stringify(logs));
    render();
}

function render() {
    // 1. Setup Inputs
    document.getElementById('dynamicInputs').innerHTML = people.map(p => 
        `<div><label style="font-size:11px">${p}</label><input type="number" id="in-${p}" step="0.1"></div>`).join('');

    // 2. Setup Header
    const head = document.getElementById('tableHeader');
    head.innerHTML = `<th>Date</th>` + people.map(p => `<th>${p}</th>`).join('') + `<th>Notes</th><th></th>`;

    // 3. Setup Body
    const body = document.getElementById('tableBody');
    body.innerHTML = logs.map(l => `
        <tr>
            <td>${l.date}</td>
            ${people.map(p => `<td><input type="number" value="${l.weights[p]}" onchange="editValue(${l.id}, '${p}', this.value)" style="width:60px; border:none; text-align:center;"></td>`).join('')}
            <td>${l.note || '-'}</td>
            <td><button class="del-btn" onclick="deleteRow(${l.id})">X</button></td>
        </tr>
    `).join('');

    renderChart();
}

function renderChart() {
    const ctx = document.getElementById('weightChart').getContext('2d');
    if (chart) chart.destroy();
    const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#8E44AD'];
    
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: logs.map(l => l.date),
            datasets: people.map((p, i) => ({
                label: p,
                data: logs.map(l => l.weights[p]),
                borderColor: colors[i % colors.length],
                tension: 0.1
            }))
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function clearAll() {
    if(confirm("Erase all data?")) { localStorage.clear(); location.reload(); }
}
