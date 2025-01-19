#include <WiFi.h>
#include <WebServer.h>
#include <FirebaseESP32.h>
#include <DHT.h>
#include <Wire.h>
#include <SFE_BMP180.h>

#define FIREBASE_HOST "https://your-project-id.firebaseio.com"  // Firebase host (replace with your Firebase database URL)
#define FIREBASE_AUTH "your_firebase_auth_token"  // Firebase authentication token (replace with your Firebase auth token)

#define DHTPIN 4            // DHT11 data pin connected to GPIO 13
#define DHTTYPE DHT11        // Define DHT type
#define SOIL_MOISTURE_PIN 34 // Soil moisture sensor analog pin
#define PUMP_PIN 5          // Pump control pin
#define RAIN_SENSOR_PIN 36 // Analog pin connected to the rain sensor

// Create an object for the BMP180 sensor
SFE_BMP180 bmp;

// Variables for temperature and pressure
double T, P;
char status;

bool pumpState;
int Auto;
float threshold;

DHT dht(DHTPIN, DHTTYPE);
FirebaseData firebaseData;
FirebaseAuth firebaseAuth;
FirebaseConfig firebaseConfig;

// Define the variable to check WiFi connection status
bool moduleConnected = false;
String moduleID = "ESP32_SIS_001";

// Wi-Fi and Web Server variables
const char* softAPSSID = "ESP32_Provisioning";
WebServer server(80);
String wifiSSID = "", wifiPassword = "";

// HTML Pages
const char* wifiPage = R"rawliteral(
<!DOCTYPE html>
<html>
<head><title>Wi-Fi Provisioning</title></head>
<body>
  <h2>Wi-Fi Provisioning</h2>
  <form action="/connect" method="POST">
    <label>SSID: <input name="ssid" required></label><br>
    <label>Password: <input type="password" name="password"></label><br>
    <button type="submit">Connect</button>
  </form>
</body>
</html>
)rawliteral";

// Connect to Wi-Fi
void connectToWiFi() {
  WiFi.softAPdisconnect();
  WiFi.begin(wifiSSID.c_str(), wifiPassword.c_str());
  Serial.print("Connecting");
  for (int i = 0; i < 10; i++) {
    if (WiFi.status() == WL_CONNECTED) break;
    delay(1000);
    Serial.print(".");
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nConnected! IP: " + WiFi.localIP().toString());
    server.send(200, "text/html", "<h1>Connected to " + wifiSSID + "</h1>");
  } else {
    Serial.println("\nConnection Failed. Re-enabling SoftAP.");
    WiFi.softAP(softAPSSID);
    server.send(200, "text/html", "<h1>Connection Failed</h1>");
  }
}

// Setup Web Server
void setupServer() {
  server.on("/", HTTP_GET, []() { server.send(200, "text/html", wifiPage); });
  server.on("/connect", HTTP_POST, []() {
    wifiSSID = server.arg("ssid");
    wifiPassword = server.arg("password");
    connectToWiFi();
  });
  server.begin();
}

void setup() {
  Serial.begin(115200);
  pinMode(PUMP_PIN, OUTPUT);
  digitalWrite(PUMP_PIN, LOW); // Change to HIGH if using active-low relay
  Serial.println("Relay test started.");
  WiFi.softAP(softAPSSID);
  Serial.println("SoftAP started: " + String(softAPSSID));
  IPAddress softAPIP = WiFi.softAPIP();
  Serial.println("SoftAP IP address: " + softAPIP.toString());
  setupServer();

  if (bmp.begin()) {
    Serial.println("BMP180 initialized successfully.");
  } else {
    Serial.println("Could not initialize BMP180 sensor. Check wiring!");
    while (1); // Halt execution if sensor initialization fails
  }

  // Set module connected to true once WiFi is connected
  moduleConnected = true;

  // Initialize Firebase
  firebaseConfig.host = FIREBASE_HOST;
  firebaseConfig.signer.tokens.legacy_token = FIREBASE_AUTH; // Use `token.token` if you have a custom token
  Firebase.begin(&firebaseConfig, &firebaseAuth);
  Firebase.reconnectWiFi(true);

  // Check Firebase connection status
  if (!Firebase.ready()) {
    Serial.println("Firebase initialization failed. Check configuration and credentials.");
    // Update Firebase to indicate module connection status
    Firebase.setBool(firebaseData, "/DeviceStatus/ModuleConnected", moduleConnected);
    Firebase.setString(firebaseData, "/DeviceStatus/ModuleID", moduleID);

  } else {
    Serial.println("Connected to Firebase");
  }

  
}

void loop() {
  server.handleClient(); // Handle HTTP requests

  // Read sensor values
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int soilMoisture = analogRead(SOIL_MOISTURE_PIN);
  float soilper = (100-((soilMoisture/4095)*100));
  int rainValue = analogRead(RAIN_SENSOR_PIN); // Read analog value from rain sensor
  //int percentage = map(rainValue, 0, 1023, 0, 100); // Convert to percentage
  //Serial.println(rainValue);
  float percentage = (100-((rainValue/4095)*100));

  if (bmp.startTemperature() && bmp.getTemperature(T) &&
      bmp.startPressure(3) && bmp.getPressure(P, T)) {
    Serial.print("Pressure: "); Serial.print(P); Serial.println(" Pa");
  } else {
    Serial.println("Error reading BMP180!");
  }

  
  Serial.print("Rain Level: ");
  Serial.print(rainValue);
  Serial.print(percentage); 
  Serial.println("%");

  Serial.print("Soil Moisture: ");
  Serial.print(soilMoisture);
  Serial.println(soilper);

  // Ensure Firebase connection is ready
  if (Firebase.ready()) {
    Firebase.setBool(firebaseData, "/DeviceStatus/ModuleConnected", moduleConnected);
    Firebase.setString(firebaseData, "/DeviceStatus/ModuleID", moduleID);
    // Retrieve Auto mode state from Firebase
    Firebase.getInt(firebaseData, "/Pump/Auto");
    Auto = firebaseData.intData();

    // Update Firebase with the latest sensor readings
    Firebase.setFloat(firebaseData, "/Parameters/SoilMoisture", soilMoisture);
    Firebase.setFloat(firebaseData, "/Parameters/Temperature", temperature);
    Firebase.setFloat(firebaseData, "/Parameters/Humidity", humidity);
    Firebase.setFloat(firebaseData, "/Parameters/Pressure", P);
    Firebase.setFloat(firebaseData, "/Parameters/Rain", rainValue);

    // Handle Auto mode logic
    /*if (Auto == 10) { // Auto mode is ON
      Firebase.getFloat(firebaseData, "/Pump/Threshold");
      threshold = firebaseData.floatData();

      // Run the pump until the soil moisture crosses the threshold
      while (soilMoisture > threshold) {
        digitalWrite(PUMP_PIN, HIGH); // Turn pump ON
        Serial.println("Pump State: ON (Auto Mode)");

        // Update soil moisture value during auto mode operation
        soilMoisture = analogRead(SOIL_MOISTURE_PIN);
        Firebase.setInt(firebaseData, "/Parameters/SoilMoisture", soilMoisture);

        delay(1000); // Delay for stability
      }

      // Turn pump OFF after crossing the threshold
      digitalWrite(PUMP_PIN, LOW);
      Serial.println("Pump State: OFF (Auto Mode)");

      // Update pump state in Firebase
      Firebase.setInt(firebaseData, "/Pump/PumpState", 0);

      // Turn Auto mode OFF in Firebase
      Auto = 0;
      Firebase.setInt(firebaseData, "/Pump/Auto", Auto);
      Serial.println("Auto mode disabled in Firebase");
    } else { // Auto mode is OFF
      // Retrieve PumpState from Firebase
      Firebase.getInt(firebaseData, "/Pump/PumpState");
      pumpState = firebaseData.intData();

      // Set pump state based on Firebase value
      if (pumpState == 20) {
        digitalWrite(PUMP_PIN, HIGH);
        Serial.println("Pump State: ON (Manual Mode)");
      } else {
        digitalWrite(PUMP_PIN, LOW);
        Serial.println("Pump State: OFF (Manual Mode)");
      }
    }*/

    Firebase.getBool(firebaseData, "/Pump/PumpState");
    pumpState = firebaseData.boolData();

    if (pumpState) {
        digitalWrite(PUMP_PIN, HIGH);
        Serial.println("Pump State: ON (Manual Mode)");
      } else {
        digitalWrite(PUMP_PIN, LOW);
        Serial.println("Pump State: OFF (Manual Mode)");
      }

    // Debugging output for sensor values
    Serial.print("Soil Moisture: ");
    Serial.println(soilMoisture);
    Serial.print(soilper);
    Serial.print("Temperature: ");
    Serial.println(temperature);
    Serial.print("Humidity: ");
    Serial.println(humidity);
  }

  // Delay for stability
  delay(200);
}



