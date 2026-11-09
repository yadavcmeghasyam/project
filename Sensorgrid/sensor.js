/**
 * Sensor.js - Modular Sensor Simulator & Ultrasonic Water Level Engine
 * Full-Stack Web Development | Sensor Telemetry Module
 */

// Base Sensor Class
class BaseSensor {
    constructor(id, name, unit, minBound, maxBound, initialValue) {
        this.id = id;
        this.name = name;
        this.unit = unit;
        this.minBound = minBound;
        this.maxBound = maxBound;
        this.value = initialValue;
        this.historyMin = initialValue;
        this.historyMax = initialValue;
    }

    // Generate random walk physics fluctuation
    getRandomDelta(step = 0.5) {
        return (Math.random() - 0.5) * 2 * step;
    }

    clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
    }
}

// 1. Temperature Sensor Class
class TemperatureSensor extends BaseSensor {
    constructor(initialValue = 24.5) {
        super('temp', 'Temperature', '°C', 15.0, 45.0, initialValue);
    }

    read() {
        const delta = this.getRandomDelta(0.4);
        this.value = this.clamp(this.value + delta, 18.0, 42.0);
        this.historyMin = Math.min(this.historyMin, this.value);
        this.historyMax = Math.max(this.historyMax, this.value);

        return {
            celsius: Number(this.value.toFixed(1)),
            fahrenheit: Number(((this.value * 9 / 5) + 32).toFixed(1)),
            min: Number(this.historyMin.toFixed(1)),
            max: Number(this.historyMax.toFixed(1)),
            status: this.value > 35 ? 'High Heat' : (this.value < 20 ? 'Cool' : 'Normal')
        };
    }
}

// 2. Humidity Sensor Class
class HumiditySensor extends BaseSensor {
    constructor(initialValue = 58.0) {
        super('humidity', 'Humidity', '%', 20.0, 95.0, initialValue);
    }

    read(temperatureCelsius = 24.5) {
        const delta = this.getRandomDelta(0.8);
        this.value = this.clamp(this.value + delta, 30.0, 90.0);

        // Approximate Dew Point calculation: T - ((100 - RH)/5)
        const dewPoint = temperatureCelsius - ((100 - this.value) / 5);

        return {
            percentage: Number(this.value.toFixed(1)),
            dewPoint: Number(dewPoint.toFixed(1)),
            comfort: (this.value >= 40 && this.value <= 65) ? 'Ideal' : (this.value > 65 ? 'Humid' : 'Dry Air'),
            status: (this.value >= 40 && this.value <= 65) ? 'Optimal' : 'Moisture Warning'
        };
    }
}

// 3. Pressure Sensor Class
class PressureSensor extends BaseSensor {
    constructor(initialValue = 1013.25) {
        super('pressure', 'Atmospheric Pressure', 'hPa', 950.0, 1050.0, initialValue);
    }

    read() {
        const delta = this.getRandomDelta(0.3);
        this.value = this.clamp(this.value + delta, 980.0, 1040.0);

        return {
            hpa: Number(this.value.toFixed(1)),
            atm: Number((this.value / 1013.25).toFixed(2)),
            status: this.value < 1000 ? 'Low Pressure' : (this.value > 1025 ? 'High Pressure' : 'Standard'),
            forecast: this.value < 1000 ? 'Storm Warning' : 'Fair & Clear'
        };
    }
}

// 4. Ultrasonic HC-SR04 Water Level Sensor Class (30 cm Tank Focus)
class UltrasonicWaterLevelSensor extends BaseSensor {
    constructor(tankHeightCm = 30.0, initialDepthCm = 21.75) {
        super('water', 'Water Level (HC-SR04)', '%', 0.0, 100.0, initialDepthCm);
        this.tankHeightCm = tankHeightCm;
    }

    read() {
        const delta = this.getRandomDelta(0.35);
        this.value = this.clamp(this.value + delta, 1.0, 29.5);

        const waterDepthCm = this.value;
        const airGapCm = this.tankHeightCm - waterDepthCm;
        const percentage = (waterDepthCm / this.tankHeightCm) * 100.0;

        let status = 'Normal';
        let detail = 'Optimal Reservoir Level';

        if (percentage < 20.0) {
            status = 'LOW WATER';
            detail = 'Critical Low Water - Pump Alert';
        } else if (percentage > 90.0) {
            status = 'TANK FULL';
            detail = 'Tank Approaching Max Capacity';
        }

        return {
            tankHeightCm: this.tankHeightCm,
            waterDepthCm: Number(waterDepthCm.toFixed(1)),
            airGapCm: Number(airGapCm.toFixed(1)),
            percentage: Number(percentage.toFixed(1)),
            status: status,
            detail: detail
        };
    }
}

// 5. Main SensorGrid Telemetry Manager Engine
class SensorGridEngine {
    constructor(intervalMs = 1000) {
        this.intervalMs = intervalMs;
        this.timerId = null;
        this.isRunning = false;
        this.updateCounter = 0;

        this.tempSensor = new TemperatureSensor();
        this.humiditySensor = new HumiditySensor();
        this.pressureSensor = new PressureSensor();
        this.waterSensor = new UltrasonicWaterLevelSensor(30.0);
    }

    getTelemetry() {
        this.updateCounter++;
        const temp = this.tempSensor.read();
        const hum = this.humiditySensor.read(temp.celsius);
        const press = this.pressureSensor.read();
        const water = this.waterSensor.read();

        return {
            timestamp: new Date().toISOString(),
            sampleIndex: this.updateCounter,
            telemetry: {
                temperature: temp,
                humidity: hum,
                pressure: press,
                waterLevel: water
            }
        };
    }

    start(callback) {
        if (this.isRunning) return;
        this.isRunning = true;
        this.timerId = setInterval(() => {
            const data = this.getTelemetry();
            if (typeof callback === 'function') {
                callback(data);
            }
        }, this.intervalMs);
    }

    stop() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
        this.isRunning = false;
    }
}

// Export for Node.js backend or attach to window for Browser frontend
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BaseSensor,
        TemperatureSensor,
        HumiditySensor,
        PressureSensor,
        UltrasonicWaterLevelSensor,
        SensorGridEngine
    };
} else if (typeof window !== 'undefined') {
    window.SensorGridEngine = SensorGridEngine;
    window.TemperatureSensor = TemperatureSensor;
    window.HumiditySensor = HumiditySensor;
    window.PressureSensor = PressureSensor;
    window.UltrasonicWaterLevelSensor = UltrasonicWaterLevelSensor;
}

// Self-Test execution when run directly via Node.js
if (typeof require !== 'undefined' && require.main === module) {
    console.log("=== SensorGrid JavaScript Engine Self-Test ===");
    const engine = new SensorGridEngine(1000);
    console.log(JSON.stringify(engine.getTelemetry(), null, 2));
}