import { cpu } from "./cpu.js";
import { insertDocuments } from "./insertDocuments.js";
import { getTrafficForInterfaces } from "./network.js";

// Function to run every 5 seconds

let oldIncomingInterface = {};
let oldOutgoingInterface = {};
let oldIncomingPacket = {};
let oldOutgoingPacket = {};

async function main(interface_list) {
  const bulkBody = [];
  const iso8601Date = new Date().toISOString();
  const cpuResponse = await cpu();
  const networkResponseIncoming = await getTrafficForInterfaces(
    interface_list,
    2
  ); // wait for promise to resolve
  const packetResponseIncoming = await getTrafficForInterfaces(
    interface_list,
    3
  ); // wait for promise to resolve
  const networkResponseOutgoing = await getTrafficForInterfaces(
    interface_list,
    10
  ); // wait for promise to resolve
  const packetResponseOutgoing = await getTrafficForInterfaces(
    interface_list,
    11
  ); // wait for promise to resolve

  if (Object.keys(oldIncomingInterface).length === 0) {
    interface_list.map((data) => {
      oldIncomingInterface[data] = 0;
      oldOutgoingInterface[data] = 0;
      oldIncomingPacket[data] = 0;
      oldOutgoingPacket[data] = 0;
      networkResponseIncoming[data] = {};
      networkResponseOutgoing[data] = {};
      packetResponseIncoming[data] = {};
      packetResponseOutgoing[data] = {};

      packetResponseIncoming[data]["incoming-pps-rate"] = 0;
      networkResponseIncoming[data]["incoming-lrl-rate"] = 0;
      packetResponseOutgoing[data]["outgoing-pps-rate"] = 0;
      networkResponseOutgoing[data]["outgoing-lrl-rate"] = 0;
      oldIncomingInterface[data] = networkResponseIncoming.traffic[data];
      oldOutgoingInterface[data] = networkResponseOutgoing.traffic[data];
      oldIncomingPacket[data] = packetResponseIncoming.traffic[data];
      oldOutgoingPacket[data] = packetResponseOutgoing.traffic[data];
    });
  } else {
    interface_list.map((data) => {
      networkResponseIncoming[data] = {};
      networkResponseOutgoing[data] = {};
      packetResponseIncoming[data] = {};
      packetResponseOutgoing[data] = {};

      packetResponseIncoming[data]["incoming-pps-rate"] =
        packetResponseIncoming.traffic[data] - oldIncomingPacket[data];

      networkResponseIncoming[data]["incoming-lrl-rate"] =
        networkResponseIncoming.traffic[data] - oldIncomingInterface[data];

      packetResponseOutgoing[data]["outgoing-pps-rate"] =
        packetResponseOutgoing.traffic[data] - oldOutgoingPacket[data];

      networkResponseOutgoing[data]["outgoing-lrl-rate"] =
        networkResponseOutgoing.traffic[data] - oldOutgoingInterface[data];

      oldIncomingInterface[data] = networkResponseIncoming.traffic[data];
      oldOutgoingInterface[data] = networkResponseOutgoing.traffic[data];
      oldIncomingPacket[data] = packetResponseIncoming.traffic[data];
      oldOutgoingPacket[data] = packetResponseOutgoing.traffic[data];
    });
  }

  bulkBody.push(
    {
      index: { _index: `monitor-network-cpu` },
    },
    {
      timestamp: iso8601Date,
      logType: "cpu",
      cpu: cpuResponse,
    }
  );

  interface_list.map((data) => {
    bulkBody.push(
      {
        index: { _index: `monitor-network-cpu` },
      },
      {
        iface: data,
        timestamp: iso8601Date,
        logType: "network",
        "incoming-lrl-rate": networkResponseIncoming[data]["incoming-lrl-rate"],
        "outgoing-lrl-rate": networkResponseOutgoing[data]["outgoing-lrl-rate"],
        "incoming-lrl": networkResponseIncoming.traffic[data],
        "outgoing-lrl": networkResponseOutgoing.traffic[data],
        "incoming-pps": packetResponseIncoming.traffic[data],
        "outgoing-pps": packetResponseOutgoing.traffic[data],
        "incoming-pps-rate": packetResponseIncoming[data]["incoming-pps-rate"],
        "outgoing-pps-rate": packetResponseOutgoing[data]["outgoing-pps-rate"],
      }
    );
  });

  // Insert the document into your database
  await insertDocuments(bulkBody);
  console.log("Data inserted successfully at", iso8601Date);
}

// List of interfaces to monitor
const interface_list = ["enp4s0"];

// Run the main function every 5 seconds
setInterval(() => {
  main(interface_list)
    .then(() => console.log("Cycle complete"))
    .catch((error) => console.error("Error in main function:", error));
}, 1000); // 1000 milliseconds = 1 seconds
