const express = require("express");

const Upload = require("../models/upload");

const uploadService = require('../services/UploadService');

const multer = require("multer");
const fs = require('fs');
const public_path = './public';
const media_dir = public_path+'/media';
const MIME_TYPE_MAP = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "video/mp4": "mp4",
    "video/x-flv": "flv",
    "video/3gpp": "3gp",
    "video/x-ms-wmv": "wmv",
    "video/x-msvideo": "avi",
    "video/quicktime": "mov"
  };
  

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const isValid = true; //MIME_TYPE_MAP[file.mimetype];
      let error = new Error("Invalid mime type");
      if (isValid) {
        error = null;
      }
        if (!fs.existsSync(media_dir)){
            fs.mkdir(media_dir, {recursive: true}, err => {})
        }
      cb(error, media_dir);
    },
    filename: (req, file, cb) => {
      const name = file.originalname
        .toLowerCase()
        .split(" ")
        .join("-");
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, name + "-" + Date.now() + "." + ext);
    }
  });

exports.post = (req, res, next) => {
    console.log(req.body.userId);
  const url = req.protocol + "://" + req.get("host");
    let newUpload = {};
    newUpload.title = req.body.title;
    newUpload.content = req.body.content;
    newUpload.contentType = req.body.contentType;
    newUpload.userId = req.body.userId;
    // newUpload.userId = 
    if(req.body.contentType == 'link'){
        newUpload.mediaPath = req.body.linkData;
    }else{
        newUpload.mediaPath = url + "/public/media/" + req.file.filename;
    }

    uploadService.createUploadSRC(newUpload)
        .then(createdUpload => {
            res.status(200).json({
              message: "upload added successfully",
              uploadId: createdUpload._id,
              upload: createdUpload,
              userId: createdUpload.userId,
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(401).json({
                message: "created fail"
            })
        });
  };



exports.update =(
    "/:id",
    multer({ storage: storage }).single("media"),
    (req, res, next) => {
    const uploadId = req.params.id;
    let imagePath = req.body.imagePath;
    const upload = Object.assign({}, req.body);
    if (req.file) {
        const url = req.protocol + "://" + req.get("host");
        upload.imagePath = url + "/public/media/" + req.file.filename
    }
    console.log(req.body);
    console.log(req.body.title);
    console.log(req.body.content);
    console.log(req.body.contentType);
    console.log(req.body.userId);
    upload.id = uploadId;
    upload.title = req.body.title;
    upload.content = req.body.content;
    upload.contentType = req.body.contentType;
    upload.userId = req.body.userId;
    
    uploadService.updateUpload(upload)
        .then(result => {
            res.status(200).json({ message: "Update successful!" });
        })
        .catch((err) => {
            console.log(err);
            res.status(401).json({
                message:"upload fail"
            });
        });
});

exports.getTotal = (req, res, next) => {
    uploadService.getAll()
        .then(documents => {
            res.status(200).json({
              message: "uploads get successfully!",
              uploads: documents
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(404).json({
                message: "get fail"
            })
        });
};

exports.get = (req, res, next) => {
    const uploadId = req.params.id;
    uploadService.getUploadById(uploadId)
        .then(upload => {
            console.log(upload);
              res.status(200).json(upload);
          })
          .catch((err) => {
            console.log(err);
            res.status(404).json({
                message: "get fail"
            })
        })
};

exports.delete = (req, res, next) => {
    uploadService.deleteUpload(req.body.id)
        .then(result => {
            console.log(result);
            res.status(200).json({ message: "upload deleted!" });
          });
}


