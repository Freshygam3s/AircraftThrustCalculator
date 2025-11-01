const output = document.getElementById("output");
const calcBtn = document.getElementById("calcBtn");
const flame = document.querySelector(".flame");

const ctx = document.getElementById("thrustChart");
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
const thrustChart = new Chart(ctx, {
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

let calcCount = 0;

calcBtn.addEventListener("click", function () {
    const rho = parseFloat(document.getElementById("density").value);
    const area = parseFloat(document.getElementById("area").value);
    const v0 = parseFloat(document.getElementById("velocity").value);
    const ve = parseFloat(document.getElementById("exhaust").value);

    if (isNaN(rho) || isNaN(area) || isNaN(v0) || isNaN(ve)) {
        output.textContent = "Invalid input";
        return;
    }

    const mDot = rho * area * v0;

    const thrust = mDot * (ve - v0);
    output.textContent = thrust.toFixed(2);

    calcCount++;
    thrustData.labels.push(calcCount);
    thrustData.datasets[0].data.push(thrust);
    thrustChart.update();

    const maxFlameHeight = 250;
    const flameSize = Math.min(maxFlameHeight, Math.max(50, thrust / 200));
    flame.style.transform = `translateX(-50%) scaleY(${flameSize / 60})`;
    flame.style.width = `${flameSize / 2}px`;
    flame.style.boxShadow = `0 0 ${flameSize / 2}px orange`;
});
