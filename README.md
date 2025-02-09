
# 🌱 IoT-Based Smart Irrigation System with ESP32 & Firebase

### 📌 Project Overview  
This project is an **IoT-based Smart Irrigation System** that leverages an **ESP32 microcontroller** to collect real-time soil moisture, temperature, humidity, rain, and atmospheric pressure data. The system sends data to **Firebase Realtime Database**, allowing users to control a **water pump manually or automatically** through a **web dashboard hosted on GitHub Pages**.  

---

## 📷 Project Images  

### 🌐 Web Dashboard Preview  
![screencapture-127-0-0-1-5500-index-html-2025-01-20-15_24_50](https://github.com/user-attachments/assets/2165e933-f104-4895-924d-1fad6572a635)


### ⚡ Circuit Diagram  
![IMG20250119191105](https://github.com/user-attachments/assets/5517a2c1-682c-49a8-8be7-6123e00f49cb)


---

## 🚀 Features  

✅ **Real-time Data Monitoring** - Display live sensor data on the web dashboard.  
✅ **Automatic & Manual Pump Control** - Users can enable auto mode or toggle the pump manually.  
✅ **Firebase Integration** - Sensor readings are updated in real-time on Firebase.  
✅ **Web Dashboard** - A user-friendly interface for control and monitoring.  
✅ **ESP32-Based System** - Utilizes ESP32 with multiple sensors for precise monitoring.  

---

## 🖥️ Web Dashboard  

The **web dashboard** is a simple yet interactive interface that displays sensor data and allows pump control. It is hosted using **GitHub Pages** and connects to **Firebase Realtime Database**.  

### 📌 Web Technologies Used  

- **HTML, CSS, JavaScript**  
- **Firebase Realtime Database**  
- **Chart.js / SVG Graphics** (for visualizing sensor data)  

### 🔗 Web Dashboard Link  

🔗 **Live Dashboard:** [GitHub Pages Link](https://your-username.github.io/smart-irrigation-dashboard) *(Replace with actual link)*  

---

## 🔧 Hardware Requirements  

| Component         | Quantity | Description |
|------------------|----------|-------------|
| ESP32           | 1        | WiFi-enabled microcontroller |
| DHT11/DHT22 Sensor | 1      | Measures temperature & humidity |
| Soil Moisture Sensor | 1    | Detects soil moisture levels |
| Rain Sensor     | 1        | Detects rain intensity |
| BMP180/BMP280  | 1        | Measures atmospheric pressure |
| Relay Module    | 1        | Controls water pump |
| Water Pump      | 1        | Pumps water when soil is dry |
| Jumper Wires    | As needed | For connections |

---

## 🛠️ Circuit Connections  

| ESP32 Pin | Sensor/Module | Description |
|-----------|--------------|-------------|
| D4        | Relay Module | Controls the pump |
| D5        | Soil Moisture Sensor | Reads soil moisture level |
| D18       | DHT11/DHT22 | Reads temperature & humidity |
| D19       | Rain Sensor | Detects rainfall |
| I2C (SDA, SCL) | BMP180/BMP280 | Reads pressure data |
| VIN, GND  | All Sensors | Power Supply |

---

## 📡 Firebase Realtime Database Structure  

The system uses Firebase Realtime Database to store and retrieve sensor values and pump status. The data structure follows a simple JSON format with key nodes such as:  

- **`/DeviceStatus/`** - Indicates if the ESP32 module is connected.  
- **`/Parameters/`** - Stores sensor readings (temperature, humidity, soil moisture, rain, pressure).  
- **`/Pump/`** - Controls pump state, auto mode, and moisture threshold for irrigation.  

---

## 📜 ESP32 Code Explanation  

### 1️⃣ **WiFi & Firebase Connection**  
- The ESP32 connects to a **WiFi network** and **Firebase Realtime Database** using credentials provided in the code.  
- **Automatic reconnection** is enabled in case of connectivity loss.  

### 2️⃣ **Sensor Data Collection**  
- **DHT11/DHT22**: Reads **temperature & humidity**.  
- **Soil Moisture Sensor**: Provides an **analog value** representing soil moisture.  
- **Rain Sensor**: Detects **rain intensity**.  
- **BMP180/BMP280**: Measures **atmospheric pressure**.  

### 3️⃣ **Data Upload to Firebase**  
- Sensor readings are **sent to Firebase** at regular intervals.  
- Data is structured in JSON format for easy retrieval by the web dashboard.  

### 4️⃣ **Pump Control Mechanism**  
- **Manual Mode**: Users can toggle the **pump ON/OFF** through Firebase.  
- **Auto Mode**:  
  - If soil moisture falls **below a set threshold**, the **pump is turned ON**.  
  - If soil moisture **exceeds the threshold**, the **pump is turned OFF**.  
- The ESP32 **retrieves control settings** from Firebase and adjusts the pump accordingly.  

### 5️⃣ **Delay & Power Optimization**  
- The ESP32 runs in a **loop with a delay** to prevent excessive Firebase requests.  
- Future improvements can include **deep sleep mode** to conserve power.  

---

## 📚 Required Libraries  

Before uploading the ESP32 code, install the following **Arduino libraries**:  

1️⃣ [FirebaseESP32](https://github.com/mobizt/Firebase-ESP-Client) - Connects ESP32 to Firebase.  
2️⃣ [DHT sensor library](https://github.com/adafruit/DHT-sensor-library) - Reads temperature & humidity.  
3️⃣ [Adafruit BMP180](https://github.com/adafruit/Adafruit_BMP085_Unified) - Measures atmospheric pressure.  

🔹 Install via **Arduino Library Manager** (`Sketch` → `Include Library` → `Manage Libraries`).

---

## 💡 Future Improvements  

🚀 **Integration with IoT Cloud Platforms** like ThingSpeak, Blynk, or MQTT.  
🌱 **AI-based Irrigation Control** using **machine learning models** to predict water needs.  
📱 **Mobile App Support** for remote access via an Android/iOS app.  
🔋 **Low-Power Mode** using ESP32 **deep sleep** for better battery efficiency.  

---
