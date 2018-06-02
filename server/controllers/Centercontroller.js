const bodyParser = require("body-parser");
const center = require("../models/Center");

//FIND ALL CENTER
exports.getAllCenter = async (req, res) => {
  const centers = await center.find();
  res.json(centers);
};

//CREATE NEW CENTER
exports.createNewCenter = async (req, res) => {
  const body = req.body;
  if (!body.name && !body.address && !body.capacity) {
    res.json({
      message: `Please fill in the required inputs`
    });
  } else if (body.name.length > 35 && body.address.length > 35) {
    res.json({
      message: `Name or Address is too long`
    });
  } else {
    const newCenter = await center.create(req.body);
    // name:body.name,
    // address:body.address,
    // capacity:body.capacity

    res.json(newCenter);
  }
};

//FIND A SINGLE USER
exports.getSingleCenter = async (req, res) => {
  const singleCenter = await center.findById(req.params.id);
  if (singleCenter) {
    res.json(singleCenter);
  } else {
    res.json({
      message: `Sorry, center does not exist`
    });
  }
};

//DELETE A CENTER
exports.deleteSingleCenter = (req, res) => {
  center.findByIdAndRemove(req.params.id, (err, center) => {
    if (center) {
      res.json({
        message: `You have successfully delete ${center}`
      });
    } else {
      res.json({
        message: `Sorry,the ID does not exist `
      });
    }
  });
};
//UPDATE A SINGLE CENTER
exports.updateSingleCenter = (req, res) => {
  center.findByIdAndUpdate(req.params.id, (err, center) => {
    if (center) {
      res.json({
        message: `You have successfully updated ${center}`
      });
    } else {
      res.json({
        message: `ID does not exist`
      });
    }
  });
};
