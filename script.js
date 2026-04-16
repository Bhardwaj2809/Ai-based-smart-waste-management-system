let complaints = [];

document.getElementById("fileInput").addEventListener("change", handleFile);

function handleFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const text = e.target.result;
        processCSV(text);
    };

    reader.readAsText(file);
}

function processCSV(data) {
    let rows = data.split("\n").slice(1);
    let bins = [];

    rows.forEach(row => {
        let cols = row.split(",");
        if (cols.length >= 3) {
            bins.push({
                id: parseInt(cols[0]),
                loc: cols[1],
                fill: parseInt(cols[2])
            });
        }
    });

    let overflowWithout = bins.filter(b => b.fill >= 80).length;

    bins.forEach(b => {
        b.predicted = Math.min(b.fill + 15, 100);

        if (complaints.includes(b.id) && b.predicted >= 80) {
            b.priority = "Very High";
        } else if (complaints.includes(b.id)) {
            b.priority = "High";
        } else if (b.predicted >= 80) {
            b.priority = "High";
        } else {
            b.priority = "Low";
        }
    });

    let overflowWith = bins.filter(b => b.fill >= 80 && b.predicted < 80).length;

    showOutput(bins, overflowWithout, overflowWith);
    drawGraph(overflowWithout, overflowWith);
}

function showOutput(bins, ow, owAI) {
    let output = `
        <p><b>Overflow WITHOUT system:</b> ${ow}</p>
        <p><b>Overflow WITH AI system:</b> ${owAI}</p>
        <p><b>Improvement:</b> ${ow - owAI}</p>
        <h3>🚛 Priority List</h3>
    `;

    bins.sort((a, b) => {
        const order = {"Very High":3, "High":2, "Low":1};
        return order[b.priority] - order[a.priority];
    });

    bins.forEach(b => {
        output += `<p>Bin ${b.id} (${b.loc}) → ${b.priority}</p>`;
    });

    document.getElementById("output").innerHTML = output;
}

function drawGraph(a, b) {
    const ctx = document.getElementById("chart").getContext("2d");

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Without System", "With AI"],
            datasets: [{
                label: "Overflow",
                data: [a, b]
            }]
        }
    });
}

function addComplaint() {
    const id = parseInt(document.getElementById("binId").value);

    if (!complaints.includes(id)) {
        complaints.push(id);

        let li = document.createElement("li");
        li.innerText = "Complaint for Bin " + id;
        document.getElementById("complaintsList").appendChild(li);
    }
}