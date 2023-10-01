const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const multer = require('multer');
require('dotenv').config();

const s3 = new AWS.S3({
	accessKeyId: process.env.AWS_KEY,
	secretAccessKey: process.env.AWS_SECRET,
	region: process.env.AWS_REGION,
});

const multerFilter = (req, file, cb) => {
	if (file.mimetype.startsWith('image')) {
		cb(null, true);
	} else {
		cb(new Error('File type should be of images.', 400), false);
	}
};

exports.multerUpload = multer({
	storage: multerS3({
		s3: s3,
		bucket: process.env.AWS_BUCKET,
		contentType: multerS3.AUTO_CONTENT_TYPE,
		key: function (req, file, cb) {
			const uniqueFilename = Date.now() + '-' + file.originalname;
			cb(null, uniqueFilename);
		},
	}),
	fileFilter: multerFilter,
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
			await s3
				.deleteObject(params, function (err, data) {
					if (err) console.log(err, err.stack);
				})
				.promise();
		});
	} catch (error) {
		console.error('Error deleting file:', error);
	}
};
