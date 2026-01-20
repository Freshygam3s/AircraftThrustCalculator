const output = document.getElementById("output");
const calcBtn = document.getElementById("calcBtn");
const flame = document.querySelector(".flame");

const resultContainer = document.createElement("div");
resultContainer.style.marginTop = "15px";
document.querySelector(".calculator").appendChild(resultContainer);

// Chart Styles
const gridStyle = { color: 'rgba(255, 255, 255, 0.2)' };
const textStyle = { color: '#fff' };

// Thrust Chart
const ctx1 = document.getElementById("thrustChart");
const thrustChart = new Chart(ctx1, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Thrust (N)',
            data: [],
            borderColor: '#00b4ff',
            borderWidth: 3,
            tension: 0.3
        }]
    },
    options: {
        scales: { 
            x: { grid: gridStyle, ticks: textStyle }, 
            y: { grid: gridStyle, ticks: textStyle } 
        },
        plugins: { legend: { labels: { color: '#fff' } } }
    }
});

// Altitude Chart
const heightCanvas = document.createElement("canvas");
document.querySelector(".chart-container").appendChild(heightCanvas);
const heightChart = new Chart(heightCanvas, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Altitude (m)',
            data: [],
            borderColor: '#00ff90',
            borderWidth: 3,
            tension: 0.3
        }]
    },
    options: {
        scales: { 
            x: { grid: gridStyle, ticks: textStyle }, 
            y: { grid: gridStyle, ticks: textStyle } 
        },
        plugins: { legend: { labels: { color: '#fff' } } }
    }
});

let calcCount = 0;

calcBtn.addEventListener("click", function () {
    const rho = parseFloat(document.getElementById("density").value); /* Gaisa blīvums*/
    const area = parseFloat(document.getElementById("area").value); /* Dzinēja izplūdes zona */
    const v0 = parseFloat(document.getElementById("velocity").value); /* Ātrums */
    const ve = parseFloat(document.getElementById("exhaust").value); /* Izplūdes gāžu ātrums */
    const mass = parseFloat(document.getElementById("mass").value); /* Gaisa kuģa masa */
    const simTime = parseFloat(document.getElementById("time").value); /* Simulācijas laiks */
    const g = parseFloat(document.getElementById("gravity").value) || 9.81; /* Gravitāciajas spēks */

    if ([rho, area, v0, ve, mass, simTime].some(isNaN)) {
        output.textContent = "Error";
        return;
    }

    const mDot = rho * area * v0; /* Masas plūsmas ātrums: m˙= ρ⋅A⋅v */
    const thrust = mDot * (ve - v0);
    output.textContent = Math.round(thrust).toLocaleString();

    // Update Flame Animation
    if (thrust > 0) {
        flame.style.opacity = "1";
        const flameScale = Math.min(5, thrust / 1000); // Scale grows with thrust
        flame.style.transform = `translateX(-50%) scaleY(${flameScale})`;
        flame.style.boxShadow = `0 0 ${flameScale * 20}px orange`;
    }

    // Update Thrust Chart
    calcCount++;
    thrustChart.data.labels.push(calcCount);
    thrustChart.data.datasets[0].data.push(thrust);
    thrustChart.update();

    // Flight Simulation
    let v = 0, alt = 0, m = mass;
    const alts = [], ts = [];
    for (let t = 0; t <= simTime; t++) {
        let acc = (thrust - (m * g)) / m;
        v += acc;
        alt += Math.max(0, v);
        alts.push(alt);
        ts.push(t);
        m -= (mDot * 0.05); 
        if (m < 100) break;
    }

    heightChart.data.labels = ts;
    heightChart.data.datasets[0].data = alts;
    heightChart.update();

    const weight = mass * g;
    resultContainer.innerHTML = thrust > weight 
        ? `<b style="color:#00ff90">LIFTOFF!</b>` 
        : `<b style="color:#ff4d4d">INSUFFICIENT THRUST</b>`;
});
