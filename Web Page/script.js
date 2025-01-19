// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, onValue, update, get } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

// Firebase configuration for demo use
const firebaseConfig = {
  apiKey: "your-api-key",  // Replace with your actual Firebase API key
  authDomain: "your-project-id.firebaseapp.com",  // Replace with your Firebase auth domain
  databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",  // Replace with your Firebase database URL
  projectId: "your-project-id",  // Replace with your Firebase project ID
  storageBucket: "your-project-id.appspot.com",  // Replace with your Firebase storage bucket
  messagingSenderId: "your-sender-id",  // Replace with your Firebase messaging sender ID
  appId: "your-app-id"  // Replace with your Firebase app ID
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// References to database nodes
const deviceStatusRef = ref(database, 'DeviceStatus');
const parametersRef = ref(database, 'Parameters');
const pumpRef = ref(database, 'Pump');

// Read data in real-time
function readData() {
  // Device Status
  onValue(deviceStatusRef, (snapshot) => {
    const data = snapshot.val();
    document.getElementById('deviceName').innerText = data.ModuleID;
    const deviceStatusDot = document.getElementById('deviceStatus');
    if (data.ModuleConnected) {
      deviceStatusDot.style.backgroundColor = 'green';
    } else {
      deviceStatusDot.style.backgroundColor = 'red';
    }
  });

  // Parameters
  onValue(parametersRef, (snapshot) => {
    const data = snapshot.val();
    let soilMoisture=100 - ((data.SoilMoisture/4095)*100);
    soilMoisture = parseFloat(soilMoisture.toFixed(2));
    let rainValue = 100 - ((data.Rain/4095)*100);
    rainValue = parseFloat(rainValue.toFixed(2));

    let airp = (data.Pressure/1100)*100;
    airp = parseFloat(airp.toFixed(2));
    let airpVal = data.Pressure;
    airpVal = parseFloat(airpVal.toFixed(2));
    updateThermometer(data.Temperature);
    //animateProgressBar(data.Humidity);
    updateProgressRain(rainValue);
    updateProgressHumidity(data.Humidity);
    //document.getElementById('humidity').innerText = `${data.Humidity}`;
    //document.getElementById('pressure').innerText = `${data.Pressure}`;
    //document.getElementById('rain').innerText = `${rainValue}`;
    //document.getElementById('soilMoisture').innerText = `${soilMoisture}`;
    document.getElementById('temperature').innerText = `${data.Temperature}`;

    updateProgressSoilMoisture(soilMoisture);

    //updatePressureMeter(75);
    updateGauge(airp,airpVal);

    


  });

  // Pump Status
  onValue(pumpRef, (snapshot) => {
    const data = snapshot.val();
    document.getElementById('autoButton').innerText = data.Auto ? 'Auto Mode On' : 'Auto Mode Off';
    document.getElementById('pumpButton').innerText = data.PumpState ? 'Turn Off Pump' : 'Turn On Pump';
  });
}

// Write data to update the Pump Threshold
function writeData() {
  const newThreshold = document.getElementById("thresholdInput").value;
  if (newThreshold === "") {
    alert("Please enter a valid threshold value!");
    return;
  }

  update(pumpRef, {
    Threshold: Number(newThreshold)
  })
    .then(() => {
      alert("Threshold updated successfully!");
      document.getElementById("thresholdInput").value = '';  // Clear input field
    })
    .catch((error) => {
      console.error("Error updating Threshold:", error);
    });
}

// Toggle pump state
function togglePump() {
    const pumpRef = ref(database, "Pump");
  
    // Retrieve the current state and update it
    get(pumpRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        update(pumpRef, { PumpState: !data.PumpState }); // Toggle PumpState
        document.getElementById('pumpButton').innerText = !data.PumpState ? 'Turn Off Pump' : 'Turn On Pump';
      } else {
        console.error("No data available at 'Pump'");
      }
    }).catch((error) => {
      console.error("Error fetching data:", error);
    });
  }
  

// Toggle Auto Mode

/*function toggleAutoMode() {
    const pumpRef = ref(database, "Pump");
  
    // Read current pump state
    get(pumpRef).then((snapshot) => {
      const data = snapshot.val();
  
      if (data.Auto) {
        // Auto mode is ON, so toggle it OFF and reset the threshold to 0
        update(pumpRef, { Auto: false, Threshold: 0 })
          .then(() => {
            // Update the UI to reflect the OFF state
            document.getElementById("autoButton").innerText = "Auto Mode OFF";
            document.getElementById("deviceStatus").innerText = "Device Status: Auto mode is OFF";
          })
          .catch((error) => {
            console.error("Error updating Auto Mode to OFF:", error);
          });
      } else {
        // Auto mode is OFF, show the modal to set the threshold value
        const modal = document.getElementById("thresholdModal");
        modal.classList.remove("hidden");
  
        // Handle the "Update" button in the modal to update Auto mode and the threshold
        document.getElementById("submitThreshold").onclick = () => {
          const newThreshold = document.getElementById("thresholdInput").value;
  
          if (newThreshold === "") {
            // Don't update if the threshold is empty
            alert("Please enter a valid threshold value!");
            return;
          }
  
          // Update the Auto mode to ON and set the new threshold in Firebase
          update(pumpRef, { Auto: true, Threshold: Number(newThreshold) })
            .then(() => {
              // Update the UI to reflect the ON state
              document.getElementById("autoButton").innerText = "Auto Mode ON";
              document.getElementById("deviceStatus").innerText = "Device Status: Auto mode is ON";
  
              // Close the modal after the update
              modal.classList.add("hidden");
            })
            .catch((error) => {
              console.error("Error updating Auto Mode and Threshold:", error);
            });
        };
  
        // Handle the "Cancel" button in the modal to keep Auto mode OFF
        document.getElementById("closeModal").onclick = () => {
          modal.classList.add("hidden"); // Hide the modal if user cancels
        };
      }
    }).catch((error) => {
      console.error("Error reading Pump state:", error);
    });
  }*/


    function updateThermometer(temperature) {
        const mercury = document.getElementById('mercury');
        const bulb = document.getElementById('bulb');
        const maxTemp = 70; // Maximum temperature for scaling
        const minTemp = -10; // Minimum temperature for scaling
        const maxHeight = 190; // Maximum height of mercury in px
        const minHeight = 25; // Minimum height of mercury in px
      
        // Calculate height based on temperature
        let height = ((temperature - minTemp) / (maxTemp - minTemp)) * (maxHeight - minHeight) + minHeight;
        height = Math.max(minHeight, Math.min(maxHeight, height)); // Clamp height between minHeight and maxHeight
      
        // Calculate color based on temperature
        let color;
        if (temperature <= 0) {
            color = '#0000ff'; // Deep Blue for freezing temperatures
        } else if (temperature <= 10) {
            color = '#3399ff'; // Light Blue for very cold
        } else if (temperature <= 20) {
            color = '#33cc33'; // Green for cool/moderate
        } else if (temperature <= 30) {
            color = '#ffff33'; // Yellow for warm
        } else if (temperature <= 40) {
            color = '#ff9933'; // Orange for hot
        } else {
            color = '#ff0000'; // Red for very hot
        }

      
        // Update mercury and bulb styles
        mercury.style.height = `${height}px`;
        mercury.style.backgroundColor = color;
        bulb.style.backgroundColor = color;
      }
      


      function updateProgressHumidity(percentage) {
        const circle = document.querySelector('.progress-ring-circle-Humidity');
        const percentageText = document.getElementById('percentageHumidity');
        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
      
        // Update the stroke-dashoffset based on the percentage
        const offset = circumference - (percentage / 100) * circumference;
        circle.style.strokeDashoffset = offset;
      
        // Update the percentage text
        percentageText.textContent = `${percentage}%`;
      
        // Set color transition based on percentage, using multiple shades of green
        let color;
      
        if (percentage <= 10) {
          color = '#e6f9e6'; // Very light green for 0% to 10%
        } else if (percentage <= 20) {
          color = '#ccf2cc'; // Light green for 10% to 20%
        } else if (percentage <= 30) {
          color = '#99e699'; // Mild green for 20% to 30%
        } else if (percentage <= 40) {
          color = '#66cc66'; // Medium green for 30% to 40%
        } else if (percentage <= 50) {
          color = '#33cc33'; // Slightly dark green for 40% to 50%
        } else if (percentage <= 60) {
          color = '#28a328'; // Green shade for 50% to 60%
        } else if (percentage <= 70) {
          color = '#1e7a1e'; // Dark green for 60% to 70%
        } else if (percentage <= 80) {
          color = '#147314'; // Very dark green for 70% to 80%
        } else if (percentage <= 90) {
          color = '#0d4d0d'; // Almost dark green for 80% to 90%
        } else {
          color = '#003300'; // Dark green for 90% to 100%
        }
      
        // Apply the calculated green shade to the stroke
        circle.style.stroke = color;
      }
      
      function updateProgressRain(percentage) {
        const circle = document.querySelector('.progress-ring-circle-Rain');
        const percentageText = document.getElementById('percentageRain');
        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
      
        // Update the stroke-dashoffset based on the percentage
        const offset = circumference - (percentage / 100) * circumference;
        circle.style.strokeDashoffset = offset;
      
        // Update the percentage text
        percentageText.textContent = `${percentage}%`;
      
        // Set color transition based on percentage, using multiple shades of blue
        let color;
      
        if (percentage <= 10) {
          color = '#e6f2ff'; // Very light blue for 0% to 10%
        } else if (percentage <= 20) {
          color = '#cce0ff'; // Light blue for 10% to 20%
        } else if (percentage <= 30) {
          color = '#99ccff'; // Mild blue for 20% to 30%
        } else if (percentage <= 40) {
          color = '#66b3ff'; // Medium blue for 30% to 40%
        } else if (percentage <= 50) {
          color = '#3399ff'; // Slightly dark blue for 40% to 50%
        } else if (percentage <= 60) {
          color = '#2680e0'; // Blue shade for 50% to 60%
        } else if (percentage <= 70) {
          color = '#1a66b3'; // Dark blue for 60% to 70%
        } else if (percentage <= 80) {
          color = '#104d80'; // Very dark blue for 70% to 80%
        } else if (percentage <= 90) {
          color = '#0a3366'; // Almost dark blue for 80% to 90%
        } else {
          color = '#00264d'; // Deep dark blue for 90% to 100%
        }
      
        // Apply the calculated blue shade to the stroke
        circle.style.stroke = color;
      }
      
      // Example usage: updateProgress(75);
      
      function updateProgressSoilMoisture(percentage) {
        const circle = document.querySelector('.progress-ring-circle-Soil-Moisture');
        const percentageText = document.getElementById('percentageSoilMoisture');
        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
      
        // Update the stroke-dashoffset based on the percentage
        const offset = circumference - (percentage / 100) * circumference;
        circle.style.strokeDashoffset = offset;
      
        // Update the percentage text
        percentageText.textContent = `${percentage}%`;
      
        // Set color transition based on percentage, using multiple shades of brown
        let color;
      
        if (percentage <= 10) {
          color = '#f2e0c9'; // Very light brown for 0% to 10%
        } else if (percentage <= 20) {
          color = '#e6c29f'; // Light brown for 10% to 20%
        } else if (percentage <= 30) {
          color = '#d49b73'; // Mild brown for 20% to 30%
        } else if (percentage <= 40) {
          color = '#b86c41'; // Medium brown for 30% to 40%
        } else if (percentage <= 50) {
          color = '#9e521b'; // Slightly dark brown for 40% to 50%
        } else if (percentage <= 60) {
          color = '#7d3f14'; // Brown shade for 50% to 60%
        } else if (percentage <= 70) {
          color = '#5a2e0e'; // Dark brown for 60% to 70%
        } else if (percentage <= 80) {
          color = '#3e1f09'; // Very dark brown for 70% to 80%
        } else if (percentage <= 90) {
          color = '#2b1406'; // Almost blackish brown for 80% to 90%
        } else {
          color = '#1a0d03'; // Deep brown for 90% to 100%
        }
      
        // Apply the calculated brown shade to the stroke
        circle.style.stroke = color;
      }
      
      // Example usage: updateProgress(75);



      function updateGauge(percent,value) {
        const gauge = document.getElementById('gauge');
        const gaugeValue = document.getElementById('gauge-value');
  
        // Clamp the percentage between 0 and 100
        percent = Math.max(0, Math.min(percent, 100));
  
        // Update CSS variables
        gauge.style.setProperty('--percent', percent);
  
        // Update the color dynamically based on the percentage
        let color = 'limegreen';
        if (percent < 50) {
          color = 'red';
        } else if (percent < 75) {
          color = 'orange';
        }
        gauge.style.setProperty('--color', color);
  
        // Update the gauge value text
        gaugeValue.textContent = `${value}`;
      }
  
      
    
    let isAutoMode = false; // Declare a global boolean variable

    function toggleAutoMode() {
      if (isAutoMode) {
        // If isAutoMode is true, turn it off
        console.log('Auto mode is OFF');
        document.getElementById("autoButton").innerText = "Auto Mode OFF";
        //togglePump();
        isAutoMode = false;
      } else {
        // If isAutoMode is false, turn it on
        console.log('Auto mode is ON');
        document.getElementById("autoButton").innerText = "Auto Mode ON";
        //togglePump();
        isAutoMode = true;
      }
    }

 // Event listeners
document.getElementById("autoButton").addEventListener("click", toggleAutoMode); 
document.getElementById("pumpButton").addEventListener("click", togglePump);
//document.getElementById("submitThreshold").addEventListener("click", writeData);

// Run the readData function to initialize real-time updates
readData();








