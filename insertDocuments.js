import { Client } from "@elastic/elasticsearch";

const esClient = new Client({
  node: `Elastic_Search_Config_ADDRESS`, // PUT Elastic Search Config HERE
    tls: {
    rejectUnauthorized: false, // This disables SSL certificate verification
  },
});

export async function insertDocuments(chunk) {
    console.log(`Inserting  documents`);

    const response = await esClient.bulk({
      refresh: true, // Optional: use this if you want the changes to be immediately searchable
      body: chunk,
    });

    // Check if there were any errors in the bulk response
    if (response.errors) {
      console.error("Bulk insertion errors detected:");
      // console.log(JSON.stringify(response));
      
      // Iterate over each item in the response to check if it failed
      for await (const item of response.items) {
        let x = 0
        if (item.index?.status == 400) {
          console.log("mitigated data",x+1,chunk[x + 1]);
           
          console.error(`Error inserting document :`, item.index?.error?.reason);
          return false;
        }
        x++
      }
    } else {
      console.log("Bulk insertion successful");
    }
    return true;

}
