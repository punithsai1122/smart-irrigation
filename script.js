// --- Advanced Irrigation System Logic ---

const App = {
    // --- 1. State Management ---
    state: {
        soilMoisture: 60,
        humidity: 55,
        pumpOn: false,
        manualMode: false,
        soilThreshold: 40,
        humidityThreshold: 85,
    },

    // --- 2. DOM Elements Cache ---
    elements: {},

    // --- 3. Chart.js Instance ---
    chart: null,

    // --- Main Initialization Method ---
    init() {
        this.cacheDOMElements();
        this.loadSettings();
        this.bindEventListeners();
        this.initChart();
        
        // Start the main simulation loop
        setInterval(() => {
            this.simulateSensorReadings();
            this.runAutomaticLogic();
            this.updateUI();
        }, 2000);

        this.updateUI(); // Initial UI update
    },

    cacheDOMElements() {
        this.elements.soilProgress = document.getElementById('soil-progress');
        this.elements.soilValue = document.getElementById('soil-value');
        this.elements.humidityProgress = document.getElementById('humidity-progress');
        this.elements.humidityValue = document.getElementById('humidity-value');
        this.elements.pumpStatusEl = document.getElementById('pump-status');
        this.elements.modeStatusEl = document.getElementById('mode-status');
        this.elements.manualModeBtn = document.getElementById('manual-mode-btn');
        this.elements.manualPumpBtn = document.getElementById('manual-pump-btn');
        this.elements.soilSlider = document.getElementById('soil-slider');
        this.elements.soilThresholdValueEl = document.getElementById('soil-threshold-value');
        this.elements.humiditySlider = document.getElementById('humidity-slider');
        this.elements.humidityThresholdValueEl = document.getElementById('humidity-threshold-value');
        this.elements.chartCanvas = document.getElementById('sensor-chart');
    },

    // --- 4. More Realistic Simulation ---
    simulateSensorReadings() {
        // Soil moisture gradually decreases, but increases when pump is on
        if (this.state.pumpOn) {
            this.state.soilMoisture = Math.min(100, this.state.soilMoisture + 15);
        } else {
            this.state.soilMoisture = Math.max(0, this.state.soilMoisture - (Math.random() * 2));
        }

        // Humidity fluctuates more smoothly
        let humidityChange = (Math.random() * 6) - 3; // Fluctuate between -3 and +3
        this.state.humidity = Math.max(0, Math.min(100, this.state.humidity + humidityChange));

        // Round the values for display
        this.state.soilMoisture = Math.round(this.state.soilMoisture);
        this.state.humidity = Math.round(this.state.humidity);
    },

    runAutomaticLogic() {
        if (!this.state.manualMode) {
            const needsWater = this.state.soilMoisture < this.state.soilThreshold;
            const preventWatering = this.state.humidity > this.state.humidityThreshold;
            this.state.pumpOn = needsWater && !preventWatering;
        }
    },

    updateUI() {
        // Update progress bars
        this.elements.soilProgress.style.width = this.state.soilMoisture + '%';
        this.elements.soilValue.innerText = this.state.soilMoisture + '%';
        this.elements.humidityProgress.style.width = this.state.humidity + '%';
        this.elements.humidityValue.innerText = this.state.humidity + '%';

        // Update pump status
        this.elements.pumpStatusEl.className = this.state.pumpOn ? "on" : "off";
        this.elements.pumpStatusEl.innerText = this.state.pumpOn ? "ON 💧" : "OFF ✅";
        
        // Update mode status and buttons
        this.elements.modeStatusEl.innerText = this.state.manualMode ? "Manual" : "Automatic";
        this.elements.manualModeBtn.innerText = this.state.manualMode ? "Switch to Automatic" : "Switch to Manual";
        this.elements.manualPumpBtn.disabled = !this.state.manualMode;
        this.elements.manualPumpBtn.innerText = this.state.pumpOn ? "Turn Pump OFF" : "Turn Pump ON";

        // Update chart data
        this.updateChartData();
    },

    bindEventListeners() {
        this.elements.manualModeBtn.addEventListener('click', () => this.toggleManualMode());
        this.elements.manualPumpBtn.addEventListener('click', () => this.manualPumpToggle());
        this.elements.soilSlider.addEventListener('input', (e) => this.updateThreshold('soil', e.target.value));
        this.elements.humiditySlider.addEventListener('input', (e) => this.updateThreshold('humidity', e.target.value));
    },

    toggleManualMode() {
        this.state.manualMode = !this.state.manualMode;
        if (!this.state.manualMode) {
            this.runAutomaticLogic();
        }
    },
    
    manualPumpToggle() {
        if (this.state.manualMode) {
            this.state.pumpOn = !this.state.pumpOn;
        }
    },

    updateThreshold(type, value) {
        if (type === 'soil') {
            this.state.soilThreshold = parseInt(value);
            this.elements.soilThresholdValueEl.innerText = value + '%';
        } else if (type === 'humidity') {
            this.state.humidityThreshold = parseInt(value);
            this.elements.humidityThresholdValueEl.innerText = value + '%';
        }
        this.saveSettings();
    },

    // --- 5. Persistent Settings with localStorage ---
    saveSettings() {
        const settings = {
            soilThreshold: this.state.soilThreshold,
            humidityThreshold: this.state.humidityThreshold
        };
        localStorage.setItem('irrigationSettings', JSON.stringify(settings));
    },

    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('irrigationSettings'));
        if (settings) {
            this.state.soilThreshold = settings.soilThreshold;
            this.state.humidityThreshold = settings.humidityThreshold;
        }
        // Update slider positions and labels to reflect loaded settings
        this.elements.soilSlider.value = this.state.soilThreshold;
        this.elements.soilThresholdValueEl.innerText = this.state.soilThreshold + '%';
        this.elements.humiditySlider.value = this.state.humidityThreshold;
        this.elements.humidityThresholdValueEl.innerText = this.state.humidityThreshold + '%';
    },

    // --- 6. Real-Time Chart ---
    initChart() {
        const ctx = this.elements.chartCanvas.getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [], // Timestamps
                datasets: [{
                    label: 'Soil Moisture (%)',
                    data: [],
                    borderColor: 'rgba(139, 90, 43, 1)',
                    backgroundColor: 'rgba(139, 90, 43, 0.2)',
                    borderWidth: 2,
                    fill: true
                }, {
                    label: 'Humidity (%)',
                    data: [],
                    borderColor: 'rgba(61, 139, 253, 1)',
                    backgroundColor: 'rgba(61, 139, 253, 0.2)',
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                },
                animation: {
                    duration: 500
                }
            }
        });
    },

    updateChartData() {
        const now = new Date();
        const label = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

        this.chart.data.labels.push(label);
        this.chart.data.datasets[0].data.push(this.state.soilMoisture);
        this.chart.data.datasets[1].data.push(this.state.humidity);

        // Limit the chart to 15 data points for a scrolling effect
        if (this.chart.data.labels.length > 15) {
            this.chart.data.labels.shift();
            this.chart.data.datasets.forEach(dataset => dataset.data.shift());
        }
        
        this.chart.update();
    }
};

// --- Start the Application ---
App.init();