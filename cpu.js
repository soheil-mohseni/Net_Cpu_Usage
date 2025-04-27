import { exec } from "child_process";

/**
 * Gets the CPU usage statistics and returns the data as a Promise.
 * @returns {Promise<Object>} - A promise that resolves to the CPU usage data.
 */
export function cpu() {
  return new Promise((resolve, reject) => {
    // Run the command to get CPU usage
    exec('top -bn1 | grep "Cpu(s)"', (error, stdout, stderr) => {
      if (error) {
        reject(`exec error: ${error}`);
        return;
      }

      // Remove the '%Cpu(s): ' part from the beginning and split the rest by commas
      const cpuStats = stdout
        .trim()
        .replace("%Cpu(s): ", "")
        .split(",")
        .map((part) => part.trim());

      // Extract individual CPU metrics into an object
      const cpuUsage = cpuStats.reduce((acc, stat) => {
        const [value, key] = stat.split(" ");
        acc[key] = parseFloat(value);
        return acc;
      }, {});

      // Calculate the user CPU usage (cpuu) based on idle time
      cpuUsage['cpuu'] = Number((100 - cpuUsage["id"]).toFixed(2));

      // Resolve the promise with the CPU usage data
      resolve(cpuUsage);
    });
  });
}
