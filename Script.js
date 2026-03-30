// Your specific Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC-moUOBcXUPFrToivZo9w_Lh76iUuY_q8",
  authDomain: "weight-tracker-926e8.firebaseapp.com",
  databaseURL: "https://weight-tracker-926e8-default-rtdb.firebaseio.com",
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

// LIVE SYNC: This function runs every time the cloud data changes
db.ref('trackerData').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        people = data.people || ["Kevin", "Mohan", "Chris", "Sedhu"];
        logs = data.logs || [];
        render(); 
    } else {
        // First time setup if database is empty
        people = ["Kevin", "Mohan", "Chris", "Sedhu"];
        render();
    }
});

function addPerson() {
    const name = document.getElementById('newName').value.trim();
    if (name) {
        people.push(name);
        saveToCloud();
        document.getElementById('newName').value = '';
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
    saveToCloud();
    document.getElementById('commentInput').value = '';
}

function editValue(logId, person, newVal) {
    const log = logs.find(l => l.id === logId);
    if (log) {
        log.weights[person] = newVal;
        saveToCloud();
    }
}

function deleteRow(id) {
    if(confirm("Delete this entry for everyone?")) {
        logs = logs.filter(l => l.id !== id);
        saveToCloud();
    }
}

// Function to push data to Google's Cloud
function saveToCloud() {
    db.ref('trackerData').set({
        people: people,
        logs: logs
    });
}

function render() {
    // 1. Setup Inputs
    document.getElementById('dynamicInputs').innerHTML = people.map(p => 
        `<div><label style="font-size:11px">${p}</label><input type="number" id="in-${p}" step="0.1" placeholder="0.0"></div>`).join('');

    // 2. Setup Header
    const head = document.getElementById('tableHeader');
    head.innerHTML = `<th>Date</th>` + people.map(p => `<th>${p.substring(0,3)}</th>`).join('') + `<th>Notes</th><th></th>`;

    // 3. Setup Body
    const body = document.getElementById('tableBody');
    body.innerHTML = logs.map(l => `
        <tr>
            <td>${l.date}</td>
            ${people.map(p => `<td><input type="number" value="${l.weights[p]}" onchange="editValue(${l.id}, '${p}', this.value)" style="width:50px; border:none; text-align:center; background:transparent;"></td>`).join('')}
            <td>${l.note || '-'}</td>
            <td><button class="del-btn" onclick="deleteRow(${l.id})" style="background:none; color:#ea4335; font-weight:bold; border:none;">X</button></td>
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
                data: logs.map(l => parseFloat(l.weights[p]) || null),
                borderColor: colors[i % colors.length],
                tension: 0.3,
                spanGaps: true
            }))
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } }
            }
        }
    });
}

function clearAll() {
    if(confirm("This will erase data for EVERYONE in the group. Are you sure?")) {
        db.ref('trackerData').remove();
        location.reload();
    }
}
