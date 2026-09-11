/**
 * SensorGrid - Main Client Script (script.js)
 * Live Sensor Telemetry Simulator & Water Level Controller
 */

document.addEventListener('DOMContentLoaded', () => {
    // Tank Constants
    const TANK_MAX_HEIGHT_CM = 30.0;
    let isRunning = true;
    let timerId = null;
    let updateCounter = 0;

    // Sensor State
    const state = {
        temperature: { current: 24.5, min: 24.5, max: 24.5 },
        humidity: { current: 58.0 },
        pressure: { current: 1013.25 },
        water: { currentDepthCm: 21.75, airGapCm: 8.25, percentage: 72.5 }
    };

    // Helper functions
    function getRandomDelta(step = 0.5) {
        return (Math.random() - 0.5) * 2 * step;
    }

    function clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
    }

    // Core 1-Second Simulation Update
    function updateSensorData() {
        updateCounter++;

        // 1. Temperature (°C)
        state.temperature.current = clamp(state.temperature.current + getRandomDelta(0.4), 18.0, 42.0);
        state.temperature.min = Math.min(state.temperature.min, state.temperature.current);
        state.temperature.max = Math.max(state.temperature.max, state.temperature.current);

        // 2. Humidity (%)
        state.humidity.current = clamp(state.humidity.current + getRandomDelta(0.8), 30.0, 90.0);

        // 3. Pressure (hPa)
        state.pressure.current = clamp(state.pressure.current + getRandomDelta(0.3), 980.0, 1040.0);

        // 4. Water Level (30 cm Tank)
        state.water.currentDepthCm = clamp(state.water.currentDepthCm + getRandomDelta(0.35), 1.0, 29.5);
        state.water.airGapCm = TANK_MAX_HEIGHT_CM - state.water.currentDepthCm;
        state.water.percentage = (state.water.currentDepthCm / TANK_MAX_HEIGHT_CM) * 100.0;

        render();
    }

    // DOM Rendering Engine
    function render() {
        const now = new Date();
        const timeString = now.toTimeString().split(' ')[0];

        // System Banner Updates
        const lastUpdatedEl = document.getElementById('lastUpdatedVal');
        const updateCountEl = document.getElementById('updateCountVal');
        if (lastUpdatedEl) lastUpdatedEl.textContent = timeString;
        if (updateCountEl) updateCountEl.textContent = updateCounter.toLocaleString();

        // 1. Temperature Rendering
        const temp = state.temperature.current;
        const tempF = (temp * 9 / 5) + 32;
        const tempValEl = document.getElementById('tempVal');
        const tempFEl = document.getElementById('tempFahrenheitVal');
        const tempMinEl = document.getElementById('tempMinVal');
        const tempMaxEl = document.getElementById('tempMaxVal');
        const tempBarEl = document.getElementById('tempBar');
        const tempBadgeEl = document.getElementById('tempBadge');

        if (tempValEl) tempValEl.textContent = temp.toFixed(1);
        if (tempFEl) tempFEl.textContent = `${tempF.toFixed(1)} °F`;
        if (tempMinEl) tempMinEl.textContent = `${state.temperature.min.toFixed(1)} °C`;
        if (tempMaxEl) tempMaxEl.textContent = `${state.temperature.max.toFixed(1)} °C`;

        const tempPct = clamp(((temp - 15) / 30) * 100, 0, 100);
        if (tempBarEl) tempBarEl.style.width = `${tempPct}%`;

        if (tempBadgeEl) {
            if (temp > 35) {
                tempBadgeEl.textContent = 'High Heat';
                tempBadgeEl.className = 'state-badge badge-danger';
            } else if (temp < 20) {
                tempBadgeEl.textContent = 'Cool';
                tempBadgeEl.className = 'state-badge badge-warning';
            } else {
                tempBadgeEl.textContent = 'Normal';
                tempBadgeEl.className = 'state-badge';
            }
        }

        // 2. Humidity Rendering
        const hum = state.humidity.current;
        const humValEl = document.getElementById('humidityVal');
        const humBarEl = document.getElementById('humidityBar');
        const dewPointEl = document.getElementById('dewPointVal');
        const humBadgeEl = document.getElementById('humidityBadge');

        if (humValEl) humValEl.textContent = hum.toFixed(1);
        if (humBarEl) humBarEl.style.width = `${hum}%`;
        if (dewPointEl) dewPointEl.textContent = `${(temp - ((100 - hum) / 5)).toFixed(1)} °C`;

        if (humBadgeEl) {
            humBadgeEl.textContent = (hum >= 40 && hum <= 65) ? 'Optimal' : 'Warning';
            humBadgeEl.className = (hum >= 40 && hum <= 65) ? 'state-badge' : 'state-badge badge-warning';
        }

        // 3. Pressure Rendering
        const press = state.pressure.current;
        const pressValEl = document.getElementById('pressureVal');
        const pressAtmEl = document.getElementById('pressureAtmVal');
        const pressBarEl = document.getElementById('pressureBar');

        if (pressValEl) pressValEl.textContent = press.toFixed(1);
        if (pressAtmEl) pressAtmEl.textContent = `${(press / 1013.25).toFixed(2)} atm`;
        if (pressBarEl) pressBarEl.style.width = `${clamp(((press - 950) / 100) * 100, 0, 100)}%`;

        // 4. Water Level Rendering (30 cm Tank)
        const waterPct = state.water.percentage;
        const waterDepth = state.water.currentDepthCm;
        const airGap = state.water.airGapCm;

        const waterPercentEl = document.getElementById('waterPercentVal');
        const waterCmEl = document.getElementById('waterCmVal');
        const waterAirGapEl = document.getElementById('waterAirGapVal');
        const tankWaterFillEl = document.getElementById('tankWaterFill');
        const waterBadgeEl = document.getElementById('waterBadge');

        if (waterPercentEl) waterPercentEl.textContent = waterPct.toFixed(1);
        if (waterCmEl) waterCmEl.textContent = `${waterDepth.toFixed(1)} cm`;
        if (waterAirGapEl) waterAirGapEl.textContent = `${airGap.toFixed(1)} cm`;
        if (tankWaterFillEl) tankWaterFillEl.style.height = `${waterPct.toFixed(1)}%`;

        if (waterBadgeEl) {
            if (waterPct < 20.0) {
                waterBadgeEl.textContent = 'LOW WATER';
                waterBadgeEl.className = 'state-badge badge-danger';
            } else if (waterPct > 90.0) {
                waterBadgeEl.textContent = 'TANK FULL';
                waterBadgeEl.className = 'state-badge badge-warning';
            } else {
                waterBadgeEl.textContent = 'Normal';
                waterBadgeEl.className = 'state-badge badge-water';
            }
        }
    }

    // Timer setup
    function startSimulation() {
        if (!timerId) {
            timerId = setInterval(updateSensorData, 1000); // 1-second updates
        }
        isRunning = true;
    }

    function pauseSimulation() {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        }
        isRunning = false;
    }

    // Attach listeners
    const toggleBtn = document.getElementById('toggleSimBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            if (isRunning) pauseSimulation();
            else startSimulation();
        });
    }

    // Initialize simulation
    render();
    startSimulation();
});