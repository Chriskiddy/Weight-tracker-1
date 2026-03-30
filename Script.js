const firebaseConfig = {
  apiKey: "AIzaSyC-moUOBcXUPFrToivZo9w_Lh76iUuY_q8",
  authDomain: "weight-tracker-926e8.firebaseapp.com",
  databaseURL: "https://weight-tracker-926e8-default-rtdb.firebaseio.com",
  projectId: "weight-tracker-926e8",
  storageBucket: "weight-tracker-926e8.appspot.com",
  messagingSenderId: "563065622359",
  appId: "1:563065622359:web:35560965d83656972236a5"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
let chart;
let people = [];
let logs = [];

// Real-time listener
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
    const goal = document.getElementById('newGoal').value;
    if (name) {
        people.push({ name: name, goal: parseFloat(goal) || 0 });
        save();
        document.getElementById('newName').value = '';
        document.getElementById('newGoal').value = '';
    }
}

function addEntry() {
    const date = document.getElementById('dateInput').value;
    const note = document.getElementById('commentInput').value;
    if (!date) return alert("Please select a date");

    let weightData = {};
    people.forEach(p => {
        const val = document.getElementById(`in-${p.name}`).value;
        weightData[p.name] = val || "0";
    });

    logs.push({ id: Date.now(), date: date, note: note, weights: weightData });
    logs.sort((a, b) => new Date(a.date) - new Date(b.date));
    save();
}

function save() {
    db.ref('trackerData').set({ people, logs });
}

function render() {
    // 1. Stats Summary
    const statsDiv = document.getElementById('statsSummary');
    statsDiv.innerHTML = people.map(p => {
        const pLogs = logs.filter(l => parseFloat(l.weights[p.name]) > 0);
        if (pLogs.length < 1) return '';
        const first = parseFloat(pLogs[0].weights[p.name]);
        const last = parseFloat(pLogs[pLogs.length-1].weights[p.name]);
        return `<div class="stat-card"><h4>${p.name}</h4><p>${(first - last).toFixed(1)}kg Lost</p></div>`;
    }).join('');

    // 2. Dynamic Input Boxes
    document.getElementById('dynamicInputs').innerHTML = people.map(p => 
        `<div><label>${p.name}</label><input type="number" id="in-${p.name}" placeholder="0.0" step="0.1"></div>`).join('');

    // 3. Table Header
    let headerHtml = `<th>Date</th>`;
    people.forEach(p => headerHtml += `<th>${p.name.substring(0,3)}</th>`);
    headerHtml += `<th>Note</th>`;
    document.getElementById('tableHeader').innerHTML = headerHtml;

    // 4. Table Rows
    document.getElementById('tableBody').innerHTML = logs.map(l => `
        <tr>
            <td>${l.date}</td>
            ${people.map(p => `<td>${l.weights[p.name] || '-'}</td>`).join('')}
            <td>${l.note || '-'}</td>
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
        
        // Actual Weight Line
        datasets.push({
            label: p.name,
            data: logs.map(l => parseFloat(l.weights[p.name]) || null),
            borderColor: color,
            backgroundColor: color,
            tension: 0.3,
            spanGaps: true
        });

        // Target Goal Line (Dashed)
        if (p.goal > 0) {
            datasets.push({
                label: `${p.name} Target`,
                data: Array(logs.length).fill(p.goal),
                borderColor: color,
                borderDash: [5, 5],
                borderWidth: 1,
                pointRadius: 0,
                fill: false
            });
        }
    });

    chart = new Chart(ctx, {
        type: 'line',
        data: { labels: logs.map(l => l.date), datasets: datasets },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            plugins: { legend: { display: true, position: 'top' } }
        }
    });
}

function clearAll() {
    if(confirm("This will delete all shared cloud data. Continue?")) {
        db.ref('trackerData').remove();
        location.reload();
    }
}
