var util = require('util');
const adModel = require('../models/Ad.model');
const fileModel = require('../models/fileSchema');
const mongoose = require('mongoose');

///// CREATE /////
exports.flag_create = function (req, res) {
  // console.log('in flag_create');

  const flagID = req.body.flagID;
  const flagData = JSON.parse(req.body.flagData); // e.g. "{'age':'18 years old'}"

  console.log(`flagID = ${flagID}`);
  console.log(`flagData = ${flagData}`);
  let model = new adModel( {
    flagID: flagID,
    flagData: JSON.stringify(flagData),
  } );

  console.log(`model = ${model}`);

  model.save(function (err) {
    if (err) {
      console.log(`err ${JSON.stringify(err)}`);
      console.log(`err.errmsg ${util.inspect(err.errmsg)}`);
      if(err.errmsg === undefined){
        console.error("Creation refused with an undefined error message");
        console.error(`full error is ${err}`);
        res.send('Model Create failed - undefined');
      } else if(err.errmsg.includes("duplicate key")){
        console.error("Creation refused for duplicate user/model key");
        res.send('Model Create failed - duplicate');
      } else {
        console.error("Error: "+err);
        res.send('Model Create failed');
      }
    } else {
      res.send('Model Created successfully');
    }
  })
};

///// QUERY /////

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

const conn = mongoose.createConnection(`${process.env.MONGODB_URI_JAF}?retryWrites=true&w=majority`);	

let gridFSBucket;	
conn.once('open', async () => {	
    gridFSBucket = await new mongoose.mongo.GridFSBucket(conn.db, {bucketName: 'photos'}); 	
})

exports.downloadFile = function(req, res){
  console.log(`in downloadFile, id = ${req.query.id}`);
  var query = { 
    _id: req.query.id,
  };

  fileModel.find(
    query,
    async function (err, docs){
      if (err) {
        console.error("Error: "+err);
        res.send('Query failed');
      } else {
        console.log(`file(s) found = ${docs}`);
        console.log(`file[0] found = ${docs[0]}`);
        console.log(`file[0].filename found = ${docs[0].filename}`);
        const filename = docs[0].filename;
        // const contentType=file[0].contentType;
        // setting response header
        // res.append("Accept-Ranges", "bytes" );
        // res.append("Content-Disposition", `attachment; filename=${filename}`);
        // res.append("Content-Type", `${contentType}`);
        // res.setHeader('Access-Control-Allow-Origin', `https://flag-client.herokuapp.com`);
        res.setHeader('Access-Control-Allow-Origin', `*`);
        // res.setHeader('Access-Control-Allow-Headers', `Origin, X-Requested-With, Content-Type, Accept`);
        // console.log(JSON.stringify(res));

        try{
          console.log(`go to make a readStream`);
          const readstream = gridFSBucket.openDownloadStreamByName(filename);
          console.log(`pipe from readStream to res`);
          readstream.pipe(res);
          console.log(`pipe attached`);
        } catch(err) {
          console.log(`gridfs err = ${err}`);
        }
      }
    }
  );
};

exports.flags_all = function (req, res) {
  var query = { 
  };
  var projection = {
  }
  // console.log(`query is ${JSON.stringify(query)}`);
  adModel.find(
    query, 
    projection,
    function (err, model) {
      if (err) {
        console.error("Error: "+err);
        res.send('Query failed');
      } else {
        const result = model;
        // console.log(`returning model ${result}`);
        res.send(result);
      }
    }
  );
};

///// DELETE /////
exports.flag_delete = function (req, res) {
  // console.log(`req.body is ${util.inspect(req.body)}`);
  var query = { 
    flagID: req.body.flagID,
  };
  adModel.deleteOne(
    query, 
    function (err, model) {
      if (err) {
        console.error("Error: "+err);
        res.send('Delete failed');
      } else if(model.deletedCount === 0){
        res.send('Nothing deleted');
      } else {
        res.send(`Deleted successfully!`);
      }
    },
  );
};