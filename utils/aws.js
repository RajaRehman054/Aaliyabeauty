const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const multer = require('multer');
require('dotenv').config();

const s3 = new AWS.S3({
	accessKeyId: process.env.AWS_KEY,
	secretAccessKey: process.env.AWS_SECRET,
	region: process.env.AWS_REGION,
});

exports.multerUpload = multer({
	storage: multerS3({
		s3: s3,
		bucket: process.env.AWS_BUCKET,
		key: function (req, file, cb) {
			const uniqueFilename = Date.now() + '-' + file.originalname;
			cb(null, uniqueFilename);
		},
	}),
});

exports.returnedUrls = async (req, res, next) => {
	const uploadedUrls = req.files.map(file => file.location);
	req.uploadedUrls = uploadedUrls;
	next();
};

exports.deleteImages = async array => {
	try {
		array.forEach(async element => {
			let url = element;
			const key = url.split('.com/');
			const params = {
				Bucket: process.env.AWS_BUCKET,
				Key: key[1],
			};
			await s3.deleteObject(params).promise();
		});
	} catch (error) {
		console.error('Error deleting file:', error);
	}
};
