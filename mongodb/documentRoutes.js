const express = require("express");
const database = require("./connect");  // Assumes that the server is running, and hence the db is connected
const ObjectId = require("mongodb").ObjectId;

let documentRoutes = express.Router();

// Find all
// "http://localhost:3001/documents"
documentRoutes.route("/documents/:user").get(async (request, response) => {
    let db = database.getDb();
    const usr = request.params.user;
    let data = await db.collection("Documents").find({ user: usr }).toArray();

    if(data.length > 0) {
        console.log(`Successfully found docs for ${usr}`);
        response.json(data);    // 'Returns' JSON value to front-end
    } else {
        console.log(`No data found for ${usr}!`);
        response.json(data);
    }
});

/*
// Find one
// "http://localhost:3001/documents/..."
documentRoutes.route("/documents/:id").get(async (request, response) => {
    let db = data.ase.getDb();
    let data = await db.collection("Documents").findOne({ _id: new ObjectId(request.params.id) });
    
    if(Object.keys(data).length > 0) {
        response.json(data);
    } else {
        throw new Error("Single doc not found!");
    }
});
*/

// Create new
documentRoutes.route("/documents").post(async (request, response) => {
    let db = database.getDb();
    let docObj = {
        user:           request.body.user,
        mint:           request.body.mint,
        creationTx:     request.body.creationTx,
        name:           request.body.name,
        location:       request.body.location,
        metadataLoc:    request.body.metadataLoc,
        hash:           request.body.hash,
        timestamp:      request.body.timestamp,
        size:           request.body.size,
        complete:       request.body.complete,
    };
    let data = await db.collection("Documents").insertOne(docObj);
    
    console.log(`Successfully wrote new entry for ${request.body.user}`);
    // For continuity's sake
    response.json(data);
});

// Update one
documentRoutes.route("/documents/:id").put(async (request, response) => {
    let db = database.getDb();
    let docObj = {
        $set: {
            user:           request.body.user,
            mint:           request.body.mint,
            creationTx:     request.body.creationTx,
            name:           request.body.name,
            location:       request.body.location,
            metadataLoc:    request.body.metadataLoc,
            hash:           request.body.hash,
            timestamp:      request.body.timestamp,
            size:           request.body.size,
            complete:       request.body.complete,
        }
    };
    let data = await db.collection("Documents").updateOne({ _id: new ObjectId(request.params.id) }, docObj);
    
    response.json(data);
});

// Delete one
documentRoutes.route("/documents/:id").delete(async (request, response) => {
    let db = database.getDb();
    let data = await db.collection("Documents").deleteOne({ _id: new ObjectId(request.params.id) });
    
    response.json(data);
});

module.exports = documentRoutes;

// const result: StoredResult = {
//     mint:           mintAccount,
//     creationTx:     customMetadata ? customMetadata.creationTransaction : timestamps[0].signature,
//     name:           solanaMetadata.name,
//     location:       customMetadata ? customMetadata.irysFileLocation : null,
//     metadataLoc:    customMetadata ? solanaMetadata.uri : null,
//     hash:           customMetadata ? customMetadata.fileHash : null,
//     timestamp:      timestamp.blockTime,
//     size:           customMetadata ? customMetadata.fileSizeBytes : null,
//     complete:       customMetadata ? true : false,
// };
