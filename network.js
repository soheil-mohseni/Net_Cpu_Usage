import { exec } from "child_process";
import { log } from "console";

/**
 * Calculates the incoming traffic for each interface provided.
 * @param {Array} interfaces - List of network interface names (e.g., ['eth0', 'wlan0']).
 * @returns {Promise<Object>} - A promise that resolves with an object containing the traffic in bytes for each interface.
 */

export function getTrafficForInterfaces(interfaces,incoming) {
    return new Promise((resolve, reject) => {
        const traffic = {};
        let totalTraffic = 0; // Initialize total traffic

        // Generate a command to get RX (received) bytes for each interface
        const commands = interfaces.map(iface => 
            `cat /proc/net/dev | grep ${iface} | awk '{print  $${(incoming) } }'`
        );

        // Execute the command for each interface
         Promise.all(commands.map((cmd, index) => {
            return new Promise((resolveCmd, rejectCmd) => {
                exec(cmd, (error, stdout, stderr) => {
                    if (error) {
                        // If the command fails (interface doesn't exist), set traffic to 0
                        traffic[interfaces[index]] = 0;
                        resolveCmd(0);
                    } else {
                        const bytes = parseInt(stdout.trim(), 10) || 0; // Ensure it's a number or 0
                        traffic[interfaces[index]] = bytes;
                        resolveCmd(bytes);
                    }
                });
            });
        }))
        .then(results => {
            // Calculate total traffic by summing up all values
            // totalTraffic = results.reduce((sum, bytes) => sum + bytes, 0);

            // Resolve the final result with traffic for each interface and total traffic
            resolve({
                traffic,
                // totalTraffic
            });
        })
        .catch(reject);
    });
}
