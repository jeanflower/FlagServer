var util = require('util');
const dealerModel = require('../models/DealerData.model');
const adModel = require('../models/Ad.model');
const fileModel = require('../models/fileSchema');
const mongoose = require('mongoose');

/*
Set this as an index in mongoDB to prevent duplicates
{
  "dealerID": 1,
  "dealershipName": -1,
}
{
  unique: true
}
*/

///// CREATE /////
exports.dealership_create = function (req, res) {
  // console.log('in dealership_create');

  const dealerID = req.body.dealerID;
  const dealershipName = req.body.dealershipName;
  const dealerData = JSON.parse(req.body.dealerData); // e.g. "{'address':'some info'}"

  let model = new dealerModel( {
    dealerID: dealerID,
    dealershipName: dealershipName,
    dealerData: JSON.stringify(dealerData),
  } );


  console.log(`model = ${model}`);
  // console.log(`create model ${model.dealershipName} with _id = ${model._id}`);

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


///// CREATE /////
exports.ad_create = function (req, res) {
  // console.log('in ad_create');

  const adID = req.body.adID;
  const dealerID = req.body.dealerID;
  const adData = JSON.parse(req.body.adData); // e.g. "{'age':'18 years old'}"

  console.log(`adID = ${adID}`);
  console.log(`dealerID = ${dealerID}`);
  console.log(`adData = ${adData}`);
  let model = new adModel( {
    adID: adID,
    dealerID: dealerID,
    adData: JSON.stringify(adData),
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
exports.dealership_details = function (req, res) {
  //console.log(`req is ${util.inspect(req)}`);
  var query = { 
    dealerID: req.query.dealerID,
    dealershipName: req.query.dealershipName,
  };
  // console.log(`query is ${JSON.stringify(query)}`);
  dealerModel.find(
    query, 
    function (err, dealers) {
      if (err) {
        console.error("Error: "+err);
        res.send('Query failed');
      } else {
        // console.log(`dealership_details got ${JSON.stringify(dealers)}`);
        res.send(dealers.map((d)=>{return d.dealerData;}));
//        res.send(dealers.map((d)=>{JSON.stringify(d)}));
      }
    }
  );
};

///// QUERY /////
exports.ad_details = function (req, res) {
  //console.log(`req is ${util.inspect(req)}`);
  var query = { 
    adID: req.query.adID,
  };
  // console.log(`query is ${JSON.stringify(query)}`);
  adModel.find(
    query, 
    function (err, ads) {
      if (err) {
        console.error("Error: "+err);
        res.send('Query failed');
      } else {
        // console.log(`ad_details got ${JSON.stringify(ads)}`);
        res.send(ads.map((a)=>{return a.adData;}));
      }
    }
  );
};

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

exports.dealership_names = function (req, res) {
  // console.log(`in dealership_names, req is ${util.inspect(req)}`);
  var query = { 
    dealerID: req.query.dealerID,
  };
  var projection = {
    _id: 0,
    dealershipName: 1, 
  }
  // console.log(`query is ${JSON.stringify(query)}`);
  dealerModel.find(
    query, 
    projection,
    function (err, model) {
      if (err) {
        console.error("Error: "+err);
        res.send('Query failed');
      } else {
        const result = model.map((m)=>{
          return m["dealershipName"];
        });
        // console.log(`returning model names ${result}`);
        res.send(result);
      }
    }
  );
};

exports.dealerships_all = function (req, res) {
  // console.log(`in dealership_all, req is ${util.inspect(req)}`);
  var query = { 
  };
  var projection = {
  }
  // console.log(`query is ${JSON.stringify(query)}`);
  dealerModel.find(
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

exports.ads_all = function (req, res) {
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

///// UPDATE /////
exports.dealership_update = function (req, res) {
  // console.log(`req.body is ${util.inspect(req.body)}`);
  var query = { 
    dealerID: req.body.dealerID,
    dealershipName: req.body.dealershipName,
  };
  // console.log(`query is ${JSON.stringify(query)}`);
  var updateData = { 
    ...query,
    dealerData: req.body.dealerData,
  };
  // console.log(`updateData is ${JSON.stringify(updateData)}`);
  dealerModel.replaceOne(// or try updateOne
    query,
    updateData, 
    function (err, model) {
      if (err) {
        console.error("Error: "+err);
        res.send('Update failed');
      } else if(model["nModified"]===1){
        res.send(`One model updated.`);
      } else if(model["nModified"]===0){
        res.send(`No model updated.`);
      } else {
        res.send(`Model ${JSON.stringify(model)} updated.`);
      }
    }
  );
};

///// DELETE /////
exports.dealership_delete = function (req, res) {
  // console.log(`req.body is ${util.inspect(req.body)}`);
  var query = { 
    dealerID: req.body.dealerID,
    dealershipName: req.body.dealershipName,
  };
  dealerModel.deleteOne(
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
exports.ad_delete = function (req, res) {
  // console.log(`req.body is ${util.inspect(req.body)}`);
  var query = { 
    adID: req.body.adID,
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