const upload = require("../middleware/upload");

const uploadFile = async (req, res) => {
  try {
    console.log(`req.originalUrl = ${req.originalUrl}`);
    console.log(`before upload req.file = ${req.file}`);
    //console.log(`before upload req.body = ${req.body}`);
    await upload(req, res);

    console.log(`after upload req.file = ${JSON.stringify(req.file)}`);
    if (req.file == undefined) {
      return res.send(`You must select a file.`);
    }

    return res.send(`{ 
      "message": "file uploaded", 
      "filename": "${req.file.filename}",
      "id": "${req.file.id}"}`);
  } catch (error) {
    console.log(error);
    return res.send(`Error when trying upload image: ${error}`);
  }
};

module.exports = {
  uploadFile: uploadFile
};
