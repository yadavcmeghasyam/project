/*
 * SensorGrid - ESP32 HC-SR04 Ultrasonic Water Level Monitoring System
 * 
 * Target Microcontroller: ESP32 (32-bit Dual-Core Wi-Fi/BLE MCU)
 * Sensor: HC-SR04 Ultrasonic Distance Sensor
 * Application: Measure water depth & calculate percentage for a 30 cm Tank
 * Simulation Platform: Wokwi (https://wokwi.com)
 */

#define TRIG_PIN 5       // ESP32 GPIO 5 connected to HC-SR04 Trigger
#define ECHO_PIN 18      // ESP32 GPIO 18 connected to HC-SR04 Echo

#define LED_GREEN 2      // GPIO 2: Normal Level Indicator LED
#define LED_YELLOW 4     // GPIO 4: High Water / Tank Full Alert LED
#define LED_RED 15       // GPIO 15: Critical Low Water Alert LED

// Tank Dimensions
const float TANK_HEIGHT_CM = 30.0;   // Tank total height = 30.0 cm
const float SPEED_OF_SOUND = 0.0343; // Speed of sound in air = 0.0343 cm/us

void setup() {
  // Initialize Serial Monitor communication at 115200 baud
  Serial.begin(115200);
  delay(1000);

  // Configure Ultrasonic Sensor GPIO Pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  // Configure Indicator LED Pins
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_YELLOW, OUTPUT);
  pinMode(LED_RED, OUTPUT);

  // Initial LED Test
  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_YELLOW, LOW);
  digitalWrite(LED_RED, LOW);

  Serial.println("==================================================");
  Serial.println("   SensorGrid ESP32 HC-SR04 Water Monitor Initialized");
  Serial.println("   Tank Max Capacity Height: 30.0 cm");
  Serial.println("==================================================");
}

void loop() {
  // 1. Clear Trigger Pin
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);

  // 2. Transmit 10 microsecond HIGH pulse to trigger ultrasonic wave burst
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // 3. Measure duration of ECHO pulse in microseconds (30ms timeout)
  long duration = pulseIn(ECHO_PIN, HIGH, 30000);

  // 4. Calculate Distance in Centimeters (Air Gap from sensor at top of tank)
  // Distance (cm) = (Duration * Speed of Sound) / 2
  float distance_cm = (duration * SPEED_OF_SOUND) / 2.0;

  // Clamp distance to valid physical tank range [0, TANK_HEIGHT_CM]
  if (distance_cm > TANK_HEIGHT_CM) distance_cm = TANK_HEIGHT_CM;
  if (distance_cm < 0) distance_cm = 0;

  // 5. Calculate Water Depth & Percentage
  float water_depth_cm = TANK_HEIGHT_CM - distance_cm;
  float water_level_pct = (water_depth_cm / TANK_HEIGHT_CM) * 100.0;

  // Clamp water level percentage between 0.0% and 100.0%
  if (water_level_pct < 0.0) water_level_pct = 0.0;
  if (water_level_pct > 100.0) water_level_pct = 100.0;

  // 6. Determine Alarm Status & LED Feedback
  String status = "NORMAL";
  if (water_level_pct < 20.0) {
    status = "LOW WATER WARNING";
    digitalWrite(LED_RED, HIGH);
    digitalWrite(LED_YELLOW, LOW);
    digitalWrite(LED_GREEN, LOW);
  } else if (water_level_pct > 90.0) {
    status = "TANK FULL ALERT";
    digitalWrite(LED_RED, LOW);
    digitalWrite(LED_YELLOW, HIGH);
    digitalWrite(LED_GREEN, LOW);
  } else {
    status = "OPTIMAL";
    digitalWrite(LED_RED, LOW);
    digitalWrite(LED_YELLOW, LOW);
    digitalWrite(LED_GREEN, HIGH);
  }

  // 7. Output Formatted Telemetry to Serial Monitor
  Serial.print("[TELEMETRY] Sensor Dist (Air Gap): ");
  Serial.print(distance_cm, 1);
  Serial.print(" cm | Water Depth: ");
  Serial.print(water_depth_cm, 1);
  Serial.print(" cm / ");
  Serial.print(TANK_HEIGHT_CM, 1);
  Serial.print(" cm | Level: ");
  Serial.print(water_level_pct, 1);
  Serial.print(" % | Status: ");
  Serial.println(status);

  // 8. 1-Second Sampling Interval
  delay(1000);
}
