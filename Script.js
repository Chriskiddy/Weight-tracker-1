window.onload = () => {
    const saved = JSON.parse(localStorage.getItem('wData')) || [];
    saved.forEach(e => addRow(e));
};

function addEntry() {
    const e = {
        d: document.getElementById('dateInput').value,
        p1: document.getElementById('p1').value,
        p2: document.getElementById('p2').value,
        p3: document.getElementById('p3').value,
        p4: document.getElementById('p4').value
    };
    if (!e.d) return alert("Select Date");
    const data = JSON.parse(localStorage.getItem('wData')) || [];
    data.push(e);
    localStorage.setItem('wData', JSON.stringify(data));
    addRow(e);
}

function addRow(e) {
    const row = `<tr><td>${e.d}</td><td>${e.p1}</td><td>${e.p2}</td><td>${e.p3}</td><td>${e.p4}</td></tr>`;
    document.getElementById('tableBody').innerHTML += row;
}
