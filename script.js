const output = document.getElementById("output");
const calcBtn = document.getElementById("calcBtn");
const flame = document.querySelector(".flame");

// Papildu informācijas vieta
const resultContainer = document.createElement("div");
resultContainer.id = "extraResults";
resultContainer.style.marginTop = "15px";
resultContainer.style.color = "#9bd3ff";
document.querySelector(".calculator").appendChild(resultContainer);

// Galvenā thrust diagramma
const ctx1 = document.getElementById("thrustChart");
const thrustData = {
    labels: [],
    datasets: [{
        label: 'Thrust (N)',
        data: [],
        borderColor: '#00b4ff',
        backgroundColor: 'rgba(0, 180, 255, 0.2)',
        borderWidth: 2,
        tension: 0.2
    }]
};
const thrustChart = new Chart(ctx1, {
    type: 'line',
    data: thrustData,
    options: {
        scales: {
            x: { 
                title: { display: true, text: 'Calculation Count', color: 'white' },
                ticks: { color: 'white' }
            },
            y: { 
                title: { display: true, text: 'Thrust (N)', color: 'white' },
                ticks: { color: 'white' }
            }
        },
        plugins: { 
            legend: { labels: { color: 'white' } } 
        }
    }
});

// Papildu grafiks augstumam pret laiku
const heightCanvas = document.createElement("canvas");
heightCanvas.id = "heightChart";
document.querySelector(".chart-container").appendChild(heightCanvas);

const heightData = {
    labels: [],
    datasets: [{
        label: 'Altitude (m)',
        data: [],
        borderColor: '#00ff90',
        backgroundColor: 'rgba(0, 255, 150, 0.2)',
        borderWidth: 2,
        tension: 0.2
    }]
};
const heightChart = new Chart(heightCanvas, {
    type: 'line',
    data: heightData,
    options: {
        scales: {
            x: { title: { display: true, text: 'Time (s)', color: 'white' }, ticks: { color: 'white' } },
            y: { title: { display: true, text: 'Altitude (m)', color: 'white' }, ticks: { color: 'white' } }
        },
        plugins: { legend: { labels: { color: 'white' } } }
    }
});

let calcCount = 0;

calcBtn.addEventListener("click", function () {
    const rho = parseFloat(document.getElementById("density").value);
    const area = parseFloat(document.getElementById("area").value);
    const v0 = parseFloat(document.getElementById("velocity").value);
    const ve = parseFloat(document.getElementById("exhaust").value);
    const mass = parseFloat(document.getElementById("mass").value);
    const simTime = parseFloat(document.getElementById("time").value);
    const g = parseFloat(document.getElementById("gravity")?.value) || 9.81; // noklusējums = 9.81

    if ([rho, area, v0, ve, mass, simTime].some(isNaN)) {
        output.textContent = "Invalid input";
        resultContainer.innerHTML = "<p>Please fill in all fields correctly!</p>";
        return;
    }

    // Vilce (N)
    const mDot = rho * area * v0;
    const thrust = mDot * (ve - v0);
    output.textContent = thrust.toFixed(2);

    // Diagramma – vilce
    calcCount++;
    thrustData.labels.push(calcCount);
    thrustData.datasets[0].data.push(thrust);
    thrustChart.update();

    // Liesmas animācija
    const maxFlameHeight = 250;
    const flameSize = Math.min(maxFlameHeight, Math.max(50, thrust / 200));
    flame.style.transform = `translateX(-50%) scaleY(${flameSize / 60})`;
    flame.style.width = `${flameSize / 2}px`;
    flame.style.boxShadow = `0 0 ${flameSize / 2}px orange`;

    // Fizikas modelis
    let currentMass = mass;
    const fuelBurnRate = 0.5 * mDot;
    let velocity = 0;
    let altitude = 0;
    const dt = 1; // laika solis (1 sekunde)

    const altitudes = [];
    const times = [];

    for (let t = 0; t <= simTime; t += dt) {
        const acceleration = (thrust - currentMass * g) / currentMass;
        velocity += acceleration * dt;
        altitude += Math.max(0, velocity * dt);
        altitudes.push(Math.max(0, altitude));
        times.push(t);
        currentMass -= fuelBurnRate * dt * 0.1;
        if (currentMass < 200 && t > 5) break;
    }

    // Augstuma grafiks
    heightData.labels = times;
    heightData.datasets[0].data = altitudes;
    heightChart.update();

    // Rezultāti
    const maxAltitude = Math.max(...altitudes);
    const totalTime = times[times.length - 1];

    // Vai lidmašīna paceļas
    const weight = mass * g;
    let statusMsg = "";
    if (thrust > weight) {
        statusMsg = `<span style="color:lightgreen;font-weight:bold;">✅ The aircraft lifts off successfully!</span>`;
        flame.style.background = "radial-gradient(ellipse at center, yellow 0%, red 70%)";
        flame.style.boxShadow = "0 0 40px yellow";
    } else {
        statusMsg = `<span style="color:#ff7070;font-weight:bold;">❌ The aircraft cannot lift off — not enough thrust.</span>`;
        flame.style.background = "radial-gradient(ellipse at center, red 0%, darkred 70%)";
        flame.style.boxShadow = "0 0 10px red";
    }

    // Izvade
    resultContainer.innerHTML = `
        <h3>Flight Simulation:</h3>
        <p><strong>Thrust:</strong> ${thrust.toFixed(2)} N</p>
        <p><strong>Max Altitude:</strong> ${maxAltitude.toFixed(1)} m</p>
        <p><strong>Flight Duration:</strong> ${totalTime.toFixed(1)} s</p>
        <p>${statusMsg}</p>
    `;
});