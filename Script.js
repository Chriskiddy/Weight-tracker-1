let chart;
// Load data from phone memory
let people = JSON.parse(localStorage.getItem('pList')) || [
    {name: "Kevin", goal: 80}, 
    {name: "Mohan", goal: 72}, 
    {name: "Chris", goal: 77}, 
    {name: "Sedhu", goal: 80}
];
let logs = JSON.parse(localStorage.getItem('wLogs')) || [];

window.onload = () => { render(); };

function addPerson() {
    const name = document.getElementById('newName').value.trim();
    const goal = document.getElementById('newGoal').value || 0;
    if (name) {
        people.push({name: name, goal: parseFloat(goal)});
        save();
        document.getElementById('newName').value = '';
        document.getElementById('newGoal').value = '';
        render();
    }
}

function addEntry() {
    const date = document.getElementById('dateInput').value;
    const note = document.getElementById('commentInput').value;
    if (!date) return alert("Please select a date");

    const entry = { id: Date.now(), date: date, note: note, weights: {} };
    people.forEach(p => {
        entry.weights[p.name] = document.getElementById(`in-${p.name}`).value || "0";
    });

    logs.push(entry);
    logs.sort((a, b) => new Date(a.date) - new Date(b.date));
    save();
    document.getElementById('commentInput').value = '';
    render();
}

function editValue(logId, personName, newVal) {
    const log = logs.find(l => l.id === logId);
    if (log) {
        log.weights[personName] = newVal;
        save();
        renderChart();
    }
}

function save() {
    localStorage.setItem('pList', JSON.stringify(people));
    localStorage.setItem('wLogs', JSON.stringify(logs));
}

function deleteRow(id) {
    if(confirm("Delete this entry?")) {
        logs = logs.filter(l => l.id !== id);
        save();
        render();
    }
}

function render() {
    // 1. Setup Input Boxes
    document.getElementById('dynamicInputs').innerHTML = people.map(p => 
        `<div><label style="font-size:11px; font-weight:bold;">${p.name}</label>
         <input type="number" id="in-${p.name}" step="0.1" placeholder="0.0"></div>`).join('');

    // 2. Setup Table Header
    const head = document.getElementById('tableHeader');
    head.innerHTML = `<th>Date</th>` + people.map(p => `<th>${p.name.substring(0,3)}</th>`).join('') + `<th>Notes</th><th></th>`;

    // 3. Setup Table Body
    const body = document.getElementById('tableBody');
    body.innerHTML = logs.map(l => `
        <tr>
            <td>${l.date}</td>
            ${people.map(p => `<td><input type="number" value="${l.weights[p.name]}" onchange="editValue(${l.id}, '${p.name}', this.value)" style="width:50px; border:none; text-align:center; background:transparent;"></td>`).join('')}
            <td>${l.note || '-'}</td>
            <td><button class="del-btn" onclick="deleteRow(${l.id})">×</button></td>
        </tr>
    `).join('');

    renderChart();
}

function renderChart() {
    const ctx = document.getElementById('weightChart').getContext('2d');
    if (chart) chart.destroy();
    const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#8E44AD'];
    
    const datasets = [];
    people.forEach((p, i) => {
        const color = colors[i % colors.length];
        // The Progress Line
        datasets.push({
            label: p.name,
            data: logs.map(l => parseFloat(l.weights[p.name]) || null),
            borderColor: color,
            backgroundColor: color,
            tension: 0.3,
            spanGaps: true
        });
        // The Target Goal Line (Dashed)
        if (p.goal > 0) {
            datasets.push({
                label: `${p.name} Goal`,
                data: Array(logs.length).fill(p.goal),
                borderColor: color,
                borderDash: [5, 5],
                pointRadius: 0,
                borderWidth: 1,
                fill: false
            });
        }
    });

    chart = new Chart(ctx, {
        type: 'line',
        data: { labels: logs.map(l => l.date), datasets },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } }
        }
    });
}

function clearAll() {
    if(confirm("Erase all data?")) { localStorage.clear(); location.reload(); }
}
