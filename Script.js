// Your specific Firebase configuration from your screenshot
const firebaseConfig = {
  apiKey: "AIzaSyC-moUOBcXUPFrToivZo9w_Lh76iUuY_q8",
  authDomain: "weight-tracker-926e8.firebaseapp.com",
  projectId: "weight-tracker-926e8",
  storageBucket: "weight-tracker-926e8.appspot.com",
  messagingSenderId: "563065622359",
  appId: "1:563065622359:web:35560965d83656972236a5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
let chart;
let people = [];
let logs = [];

// AUTO-SYNC: This listens for changes from ANY phone
db.ref('trackerData').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        people = data.people || [];
        logs = data.logs || [];
        render(); 
    }
});

function addPerson() {
    const name = document.getElementById('newName').value.trim();
    const goal = document.getElementById('newGoal').value || 0;
    if (name) {
        people.push({name, goal: parseFloat(goal)});
        saveToCloud();
        document.getElementById('newName').value = '';
    }
}

function addEntry() {
    const date = document.getElementById('dateInput').value;
    const note = document.getElementById('commentInput').value;
    if (!date) return alert("Select a date");

    const entry = { id: Date.now(), date, note, weights: {} };
    people.forEach(p => {
        entry.weights[p.name] = document.getElementById(`in-${p.name}`).value || "0";
    });

    logs.push(entry);
    logs.sort((a, b) => new Date(a.date) - new Date(b.date));
    saveToCloud();
}

function saveToCloud() {
    db.ref('trackerData').set({ people, logs });
}

function deleteRow(id) {
    logs = logs.filter(l => l.id !== id);
    saveToCloud();
}

function render() {
    // Stats Summary
    const statsDiv = document.getElementById('statsSummary');
    statsDiv.innerHTML = people.map(p => {
        const pLogs = logs.filter(l => parseFloat(l.weights[p.name]) > 0);
        if (pLogs.length < 1) return '';
        const first = parseFloat(pLogs[0].weights[p.name]);
        const last = parseFloat(pLogs[pLogs.length-1].weights[p.name]);
        return `<div class="stat-card"><h4>${p.name}</h4><p>${(first - last).toFixed(1)}kg Lost</p></div>`;
    }).join('');

    // Inputs
    document.getElementById('dynamicInputs').innerHTML = people.map(p => 
        `<div><label>${p.name}</label><input type="number" id="in-${p.name}" step="0.1"></div>`).join('');

    // Table Header
    document.getElementById('tableHeader').innerHTML = `<th>Date</th>` + people.map(p => `<th>${p.name.slice(0,3)}</th>`).join('') + `<th>Note</th><th></th>`;

    // Table Body
    document.getElementById('tableBody').innerHTML = logs.map(l => `
        <tr>
            <td>${l.date}</td>
            ${people.map(p => `<td>${l.weights[p.name]}</td>`).join('')}
            <td>${l.note || '-'}</td>
            <td><button onclick="deleteRow(${l.id})">X</button></td>
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
        datasets.push({
            label: p.name,
            data: logs.map(l => l.weights[p.name]),
            borderColor: colors[i % colors.length],
            tension: 0.2
        });
    });
    chart = new Chart(ctx, {
        type: 'line',
        data: { labels: logs.map(l => l.date), datasets: datasets },
        options: { responsive: true, maintainAspectRatio: false }
    });
}
