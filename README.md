# Network and CPU Monitor

This repository contains a Node.js application that monitors CPU usage and network traffic (incoming/outgoing bytes and packets) for specified network interfaces. The collected data is logged to an Elasticsearch instance for analysis and visualization. The application runs continuously, collecting metrics every second and storing them in an Elasticsearch index.

## Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Dependencies](#dependencies)
- [Contributing](#contributing)


## Features
- Monitors CPU usage (user, system, idle, etc.) using the `top` command.
- Tracks network traffic (bytes and packets) for specified interfaces using `/proc/net/dev`.
- Calculates rates for incoming/outgoing bytes (`lrl-rate`) and packets (`pps-rate`).
- Logs metrics to an Elasticsearch index (`monitor-network-cpu`) with timestamps.
- Runs continuously with a configurable interval (default: 1 second).
- Handles errors gracefully during data collection and insertion.

## Prerequisites
- **Node.js**: Version 14 or higher.
- **Elasticsearch**: A running Elasticsearch instance (version 7.x or 8.x).
- **Linux System**: The application relies on Linux-specific commands (`top`, `/proc/net/dev`).
- **Network Interfaces**: Valid network interfaces (e.g., `enp4s0`) to monitor.

## Installation
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/network-cpu-monitor.git
   cd network-cpu-monitor
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```
   Required Node.js packages:
   - `@elastic/elasticsearch`: For interacting with Elasticsearch.

3. **Set Up Elasticsearch**:
   - Ensure your Elasticsearch instance is running and accessible.
   - Update the Elasticsearch connection details in `insertDocuments.js` (see [Configuration](#configuration)).

## Configuration
1. **Elasticsearch Connection**:
   - Open `insertDocuments.js` and replace `Elastic_Search_Config_ADDRESS` with your Elasticsearch node URL (e.g., `http://localhost:9200` or `https://your-elasticsearch-host:9200`).
     ```javascript
     const esClient = new Client({
       node: 'http://localhost:9200', // Update this
       tls: {
         rejectUnauthorized: false, // Disable SSL verification (use with caution)
       },
     });
     ```
   - If your Elasticsearch instance requires authentication, add credentials:
     ```javascript
     const esClient = new Client({
       node: 'http://localhost:9200',
       auth: {
         username: 'your-username',
         password: 'your-password'
       },
       tls: {
         rejectUnauthorized: false,
       },
     });
     ```

2. **Network Interfaces**:
   - In `index.js`, update the `interface_list` array with the network interfaces you want to monitor (e.g., `eth0`, `wlan0`).
     ```javascript
     const interface_list = ['enp4s0']; // Add your interfaces here
     ```
   - Find available interfaces on your system:
     ```bash
     ip link show
     ```

3. **Monitoring Interval**:
   - The application runs every 1 second by default. Modify the `setInterval` in `index.js` to change the interval (in milliseconds):
     ```javascript
     setInterval(() => {
       main(interface_list)
         .then(() => console.log("Cycle complete"))
         .catch((error) => console.error("Error in main function:", error));
     }, 1000); // Change 1000 to desired interval
     ```

## Usage
1. **Start the Application**:
   ```bash
   node index.js
   ```
   - The application will start monitoring CPU and network traffic, logging data to Elasticsearch every second.
   - Console output will show:
     ```
     Data inserted successfully at 2025-04-27T12:34:56.789Z
     Cycle complete
     ```

2. **Verify Data in Elasticsearch**:
   - Check that data is being inserted into the `monitor-network-cpu` index:
     ```bash
     curl -X GET "http://localhost:9200/monitor-network-cpu/_search?pretty"
     ```
   - Or use Kibana (if set up) to visualize the data.

3. **Stop the Application**:
   - Press `Ctrl+C` in the terminal to stop the process.

## Project Structure
```
network-cpu-monitor/
├── index.js              # Main script to collect and log CPU/network metrics
├── cpu.js                # Module to collect CPU usage data
├── network.js            # Module to collect network traffic data
├── insertDocuments.js    # Module to insert data into Elasticsearch
├── package.json          # Node.js project configuration
└── README.md             # Project documentation
```

- **`index.js`**: Orchestrates the monitoring process, collecting CPU and network metrics and sending them to Elasticsearch.
- **`cpu.js`**: Uses the `top` command to gather CPU usage statistics (user, system, idle, etc.).
- **`network.js`**: Reads `/proc/net/dev` to collect incoming/outgoing bytes and packets for specified interfaces.
- **`insertDocuments.js`**: Handles bulk insertion of metrics into an Elasticsearch index.

## Dependencies
- `@elastic/elasticsearch`: Client library for Elasticsearch.
- Node.js built-in modules:
  - `child_process`: For executing system commands (`top`, `cat`).
  - No additional external dependencies are required.

Install dependencies:
```bash
npm install @elastic/elasticsearch
```

## Contributing
Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes and commit (`git commit -m "Add your feature"`).
4. Push to your branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

Please ensure your code follows the existing style and includes appropriate tests.
