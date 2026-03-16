const Image = require("../models/Image");
const { uploadToCloudinary } = require("../helpers/cloudinaryHelper");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");

const uploadImageController = async (req, res) => {
  try {
    // check if file is missing in req object
    if (!req.file) {
      return res.status(400).json({
        status: false,
        message: "File is required. Please upload an image!",
      });
    }

    // upload to cloudinary
    const { url, publicId } = await uploadToCloudinary(req.file.path);

    // store the image url and public id along with the uploaded user id in the database
    const newlyUploadedImage = new Image({
      url,
      publicId,
      uploadedBy: req.userInfo.userId,
    });
    await newlyUploadedImage.save();

    // delete the file from local storage
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully!",
      image: newlyUploadedImage,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({
      status: false,
      message: "Something went wrong! Please try again.",
    });
  }
};

const fetchImagesController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    const skip = (page - 1) * limit;

    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const totalImages = await Image.countDocuments();
    const totalPages = Math.ceil(totalImages / limit);

    const sortObj = {};
    sortObj[sortBy] = sortOrder;
    const images = await Image.find({}).sort(sortObj).skip(skip).limit(limit);

    if (images) {
      res.status(200).json({
        success: true,
        currentPage: page,
        totalPages: totalPages,
        totalImages: totalImages,
        message: "Images fetched successfully!",
        data: images,
      });
    }
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({
      status: false,
      message: "Something went wrong! Please try again.",
    });
  }
};

const deleteImageController = async (req, res) => {
  try {
    const imageId = req.params.id;
    const userId = req.userInfo.userId;

    // find the image in the database
    const image = await Image.findById(imageId);

    if (!image) {
      return res.status(404).json({
        status: false,
        message: "Image not found!",
      });
    }

    // Check if the user is the owner of the image
    if (image.uploadedBy.toString() !== userId) {
      return res.status(403).json({
        status: false,
        message: "You are not authorized to delete this image!",
      });
    }

    // delete the image first from cloudinary
    await cloudinary.uploader.destroy(image.publicId);

    // Find the image by ID and delete it from database
    const deletedImage = await Image.findByIdAndDelete(imageId);

    if (!deletedImage) {
      return res.status(404).json({
        status: false,
        message: "Image not found!",
      });
    }

    res.status(200).json({
      status: true,
      message: "Image deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({
      status: false,
      message: "Something went wrong! Please try again.",
    });
  }
};

module.exports = {
  uploadImageController,
  fetchImagesController,
  deleteImageController,
};
