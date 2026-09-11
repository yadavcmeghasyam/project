# SensorGrid: Web Telemetry Simulator & ESP32 HC-SR04 Water Level Monitor

A full-stack IoT Sensor Monitoring Dashboard and ESP32 Embedded Water Level Monitor with 1-second telemetry updates, dynamic visualization, and Wokwi simulation integration.

---

## 🌟 Key Features

1. **Web Dashboard (`index.html`, `style.css`)**:
   - Modern Glassmorphism Dark Mode UI built with HTML5 & Vanilla CSS.
   - **4 Telemetry Cards**:
     - 🌡️ **Temperature**: Current °C, °F, Min/Max statistics, thermal gauge bar & status badge.
     - 💧 **Humidity**: Relative Humidity %, Dew Point (°C), comfort range gauge bar.
     - ⏲️ **Pressure**: Barometric pressure in hPa, converted atm pressure.
     - 🌊 **Water Level**: Calculated depth for a 30 cm tank, air gap, percentage level, state badge, and an animated 30 cm vertical tank fill visualizer.

2. **JavaScript Sensor Simulator (`script.js`, `sensor.js`)**:
   - Automatic 1-second dynamic updates via `setInterval()` and DOM manipulation.
   - Realistic random-walk physics bounded within realistic environmental constraints.
   - Interactive simulation control (`Pause / Resume`).
   - Modular OOP architecture (`BaseSensor`, `TemperatureSensor`, `HumiditySensor`, `PressureSensor`, `UltrasonicWaterLevelSensor`, `SensorGridEngine`).

3. **ESP32 & HC-SR04 Water Level Monitor (`main.ino`, `diagram.json`)**:
   - Arduino C++ code for ESP32 microcontroller paired with HC-SR04 Ultrasonic Distance Sensor.
   - Precise distance calculation for a **30.0 cm Tank**:
     $$\text{Air Gap (cm)} = \frac{\text{Echo Duration (\mu s)} \times 0.0343}{2}$$
     $$\text{Water Depth (cm)} = 30.0\,\text{cm} - \text{Air Gap (cm)}$$
     $$\text{Water Level (\%)} = \left(\frac{\text{Water Depth}}{30.0}\right) \times 100\%$$
   - 1-second Serial Monitor log output at 115200 baud rate.
   - Status LEDs for Normal (Green), Tank Full (Yellow), and Low Water Alert (Red).

---

## 🛠️ Circuit Wiring (Wokwi ESP32 + HC-SR04)

| Component | Component Pin | ESP32 GPIO Pin | Description |
|---|---|---|---|
| **HC-SR04** | VCC | 3V3 / 5V | Power Supply |
| **HC-SR04** | GND | GND | Ground |
| **HC-SR04** | TRIG | GPIO 5 | Ultrasonic Trigger Pulse |
| **HC-SR04** | ECHO | GPIO 18 | Ultrasonic Echo Signal |
| **Green LED** | Anode (+) | GPIO 2 | Normal Water Level Indicator |
| **Yellow LED**| Anode (+) | GPIO 4 | Tank Full / High Water Alert |
| **Red LED** | Anode (+) | GPIO 15 | Critical Low Water Alert |

---

## 🚀 How to Run locally

### 1. Web Dashboard Simulator
Start local HTTP dev server:
```bash
npm run dev
# or
npx http-server -p 3000 -c-1
```
Open `http://localhost:3000` in your web browser.

### 2. Node.js Telemetry Self-Test
Run the backend modular test engine:
```bash
npm test
# or
node sensor.js
```

---

## 📁 Repository Structure
```
Sensorgrid/
├── index.html        # Main Web Dashboard UI
├── style.css         # Glassmorphism Stylesheet & Animations
├── script.js         # DOM Controller & setInterval Loop
├── sensor.js         # Modular Sensor Classes & Telemetry Engine
├── main.ino          # ESP32 Arduino C++ Firmware for Wokwi
├── diagram.json      # Wokwi ESP32 HC-SR04 Circuit Layout
└── package.json      # NPM Scripts & Dependencies
```
