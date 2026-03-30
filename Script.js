let myChart;

window.onload = () => {
    updateUI();
};

function addEntry() {
    const d = document.getElementById('dateInput').value;
    if (!d) return alert("Select Date");

    const entry = {
        id: Date.now(),
        date: d,
        p1: parseFloat(document.getElementById('p1').value) || 0,
        p2: parseFloat(document.getElementById('p2').value) || 0,
        p3: parseFloat(document.getElementById('p3').value) || 0,
        p4: parseFloat(document.getElementById('p4').value) || 0
    };

    const data = JSON.parse(localStorage.getItem('wData')) || [];
    data.push(entry);
    // Sort by date
    data.sort((a, b) => new Date(a.date) - new Date(b.date));
    localStorage.setItem('wData', JSON.stringify(data));
    
    updateUI();
    clearInputs();
}

function deleteEntry(id) {
    let data = JSON.parse(localStorage.getItem('wData')) || [];
    data = data.filter(item => item.id !== id);
    localStorage.setItem('wData', JSON.stringify(data));
    updateUI();
}

function updateUI() {
    const data = JSON.parse(localStorage.getItem('wData')) || [];
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    data.forEach(e => {
        const row = `<tr>
            <td>${e.date.split('-').slice(1).join('/')}</td>
            <td>${e.p1}</td><td>${e.p2}</td><td>${e.p3}</td><td>${e.p4}</td>
            <td><button class="del-btn" onclick="deleteEntry(${e.id})">X</button></td>
        </tr>`;
        tbody.innerHTML += row;
    });
    renderChart(data);
}

function renderChart(data) {
    const ctx = document.getElementById('weightChart').getContext('2d');
    if (myChart) myChart.destroy();
    
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(e => e.date),
            datasets: [
                { label: 'Kevin', data: data.map(e => e.p1), borderColor: '#4285F4', fill: false },
                { label: 'Mohan', data: data.map(e => e.p2), borderColor: '#EA4335', fill: false },
                { label: 'Chris', data: data.map(e => e.p3), borderColor: '#FBBC05', fill: false },
                { label: 'Sedhu', data: data.map(e => e.p4), borderColor: '#34A853', fill: false }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function clearInputs() {
    ['p1', 'p2', 'p3', 'p4'].forEach(id => document.getElementById(id).value = '');
}
