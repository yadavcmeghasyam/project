/**
 * SensorGrid - Client Telemetry Controller (script.js)
 * Real-time DOM Updates & Interval-driven Sensor Simulation Engine
 */

document.addEventListener('DOMContentLoaded', () => {
    // 30 cm Water Tank Constants
    const TANK_MAX_HEIGHT_CM = 30.0;
    let isRunning = true;
    let timerId = null;
    let updateCounter = 0;

    // Simulation Internal State
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

    // Task 2: Core 1-Second Simulation Update Function
    function updateSensorData() {
        updateCounter++;

        // 1. Temperature (°C) bounded between 18.0°C and 42.0°C
        state.temperature.current = clamp(state.temperature.current + getRandomDelta(0.4), 18.0, 42.0);
        state.temperature.min = Math.min(state.temperature.min, state.temperature.current);
        state.temperature.max = Math.max(state.temperature.max, state.temperature.current);

        // 2. Humidity (%) bounded between 30.0% and 90.0%
        state.humidity.current = clamp(state.humidity.current + getRandomDelta(0.8), 30.0, 90.0);

        // 3. Pressure (hPa) bounded between 980.0 hPa and 1040.0 hPa
        state.pressure.current = clamp(state.pressure.current + getRandomDelta(0.3), 980.0, 1040.0);

        // 4. Water Level for 30 cm Tank: Water Depth bounded between 1.0 cm and 29.5 cm
        state.water.currentDepthCm = clamp(state.water.currentDepthCm + getRandomDelta(0.35), 1.0, 29.5);
        state.water.airGapCm = TANK_MAX_HEIGHT_CM - state.water.currentDepthCm;
        state.water.percentage = (state.water.currentDepthCm / TANK_MAX_HEIGHT_CM) * 100.0;

        render();
    }

    // DOM Manipulation & Rendering Engine
    function render() {
        const now = new Date();
        const timeString = now.toTimeString().split(' ')[0];

        // System Banner Updates
        const lastUpdatedEl = document.getElementById('lastUpdatedVal');
        const updateCountEl = document.getElementById('updateCountVal');
        if (lastUpdatedEl) lastUpdatedEl.textContent = timeString;
        if (updateCountEl) updateCountEl.textContent = updateCounter.toLocaleString();

        // -------------------------------------------------------------
        // 1. Temperature Rendering
        // -------------------------------------------------------------
        const temp = state.temperature.current;
        const tempF = (temp * 9 / 5) + 32;
        const tempValEl = document.getElementById('tempVal');
        const tempFEl = document.getElementById('tempFahrenheitVal');
        const tempMinEl = document.getElementById('tempMinVal');
        const tempMaxEl = document.getElementById('tempMaxVal');
        const tempBarEl = document.getElementById('tempBar');
        const tempBadgeEl = document.getElementById('tempBadge');
        const legacyTempEl = document.getElementById('temperature');

        if (tempValEl) tempValEl.textContent = temp.toFixed(1);
        if (legacyTempEl) legacyTempEl.textContent = `${temp.toFixed(1)} °C`;
        if (tempFEl) tempFEl.textContent = `${tempF.toFixed(1)} °F`;
        if (tempMinEl) tempMinEl.textContent = `${state.temperature.min.toFixed(1)} °C`;
        if (tempMaxEl) tempMaxEl.textContent = `${state.temperature.max.toFixed(1)} °C`;

        const tempPct = clamp(((temp - 15) / 30) * 100, 0, 100);
        if (tempBarEl) tempBarEl.style.width = `${tempPct.toFixed(1)}%`;

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

        // -------------------------------------------------------------
        // 2. Humidity Rendering
        // -------------------------------------------------------------
        const hum = state.humidity.current;
        const humValEl = document.getElementById('humidityVal');
        const humBarEl = document.getElementById('humidityBar');
        const dewPointEl = document.getElementById('dewPointVal');
        const humBadgeEl = document.getElementById('humidityBadge');
        const legacyHumEl = document.getElementById('humidity');

        if (humValEl) humValEl.textContent = hum.toFixed(1);
        if (legacyHumEl) legacyHumEl.textContent = `${hum.toFixed(1)} %`;
        if (humBarEl) humBarEl.style.width = `${hum.toFixed(1)}%`;
        if (dewPointEl) dewPointEl.textContent = `${(temp - ((100 - hum) / 5)).toFixed(1)} °C`;

        if (humBadgeEl) {
            humBadgeEl.textContent = (hum >= 40 && hum <= 65) ? 'Optimal' : (hum > 65 ? 'High Humidity' : 'Low Moisture');
            humBadgeEl.className = (hum >= 40 && hum <= 65) ? 'state-badge' : 'state-badge badge-warning';
        }

        // -------------------------------------------------------------
        // 3. Pressure Rendering
        // -------------------------------------------------------------
        const press = state.pressure.current;
        const pressValEl = document.getElementById('pressureVal');
        const pressAtmEl = document.getElementById('pressureAtmVal');
        const pressBarEl = document.getElementById('pressureBar');
        const pressBadgeEl = document.getElementById('pressureBadge');
        const legacyPressEl = document.getElementById('pressure');

        if (pressValEl) pressValEl.textContent = press.toFixed(1);
        if (legacyPressEl) legacyPressEl.textContent = `${press.toFixed(1)} hPa`;
        if (pressAtmEl) pressAtmEl.textContent = `${(press / 1013.25).toFixed(2)} atm`;
        if (pressBarEl) pressBarEl.style.width = `${clamp(((press - 950) / 100) * 100, 0, 100).toFixed(1)}%`;

        if (pressBadgeEl) {
            pressBadgeEl.textContent = press < 1000 ? 'Low Baro' : (press > 1025 ? 'High Baro' : 'Standard');
            pressBadgeEl.className = press < 1000 || press > 1025 ? 'state-badge badge-warning' : 'state-badge';
        }

        // -------------------------------------------------------------
        // 4. Water Level Rendering (30 cm Tank Focus)
        // -------------------------------------------------------------
        const waterPct = state.water.percentage;
        const waterDepth = state.water.currentDepthCm;
        const airGap = state.water.airGapCm;

        const waterPercentEl = document.getElementById('waterPercentVal');
        const waterCmEl = document.getElementById('waterCmVal');
        const waterAirGapEl = document.getElementById('waterAirGapVal');
        const tankWaterFillEl = document.getElementById('tankWaterFill');
        const waterBadgeEl = document.getElementById('waterBadge');
        const legacyWaterEl = document.getElementById('waterLevel');

        if (waterPercentEl) waterPercentEl.textContent = waterPct.toFixed(1);
        if (legacyWaterEl) legacyWaterEl.textContent = `${waterPct.toFixed(1)} %`;
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

    // Timer setup with setInterval()
    function startSimulation() {
        if (!timerId) {
            timerId = setInterval(updateSensorData, 1000); // 1-second automatic updates
        }
        isRunning = true;
        updateToggleButtonUI(true);
    }

    function pauseSimulation() {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        }
        isRunning = false;
        updateToggleButtonUI(false);
    }

    function updateToggleButtonUI(active) {
        const toggleBtn = document.getElementById('toggleSimBtn');
        const btnText = document.getElementById('toggleBtnText');
        if (!toggleBtn) return;

        if (active) {
            toggleBtn.innerHTML = '<i class="fa-solid fa-pause"></i> <span id="toggleBtnText">Pause Simulation</span>';
            toggleBtn.className = 'btn btn-primary';
        } else {
            toggleBtn.innerHTML = '<i class="fa-solid fa-play"></i> <span id="toggleBtnText">Resume Simulation</span>';
            toggleBtn.className = 'btn btn-primary btn-resume';
        }
    }

    // Attach control button event listener
    const toggleBtn = document.getElementById('toggleSimBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            if (isRunning) pauseSimulation();
            else startSimulation();
        });
    }

    // Initialize dashboard rendering and start 1-second interval loop
    render();
    startSimulation();
});