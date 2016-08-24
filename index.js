var cheerio = require('cheerio'),
	getImageSize = require('image-size'),
	fs = require('fs'),
	log = console.log.bind(console);

// See README for imageOverrides format
module.exports = function(imageOverrides){

	imageOverrides = imageOverrides || {};

	var cache = {}

	var getSize = function(imageFile){
		// Since we're part of page rendering, we return null results if the file is missing
		var status;
		try {
		  status = fs.statSync(imageFile);
		} catch (err) {
		  if ( err.code === 'ENOENT' )
		  console.error("Missing image file:", imageFile)
		  return {
		  	height: null,
		  	width: null,
		  	type: null
		  }
		}
		var cachedDimensions = cache[imageFile]
		if ( cachedDimensions ) {
			return cachedDimensions
		}
		var dimensions = getImageSize(imageFile)
		cache[imageFile] = dimensions;
		return dimensions;
	}

	var stripInlineStyles = function(html){
		var $ = cheerio.load(html);
		$('*').removeAttr('style');
		var ampHTML = $.html();
		return ampHTML;
	}

	var renderAMP = function(req, res, next) {
		res.renderAMP = function(template, templateVars){
			res.render(template, templateVars, function(err, output){
				if ( err ) {
					next(err);
					return
				}
				var ampHTML = toAmp(output);
				res.status(200).send(ampHTML);
			})
		};
		next();
	}

	var imgToAmpImg = function(html){
		var $ = cheerio.load(html);

		// AMP images need exact sizes
		$('img').each(function(index, imageElement) {
			var image = $(imageElement)
			var originalAttributes = image.attr()
			var attributes = {
				layout: "responsive",
				alt: "an image"
			};

			for ( var originalAttribute in originalAttributes ) {
				attributes[originalAttribute] = originalAttributes[originalAttribute]
			}

			// Now get the pixel sizes
			var imageFile = attributes.src;

			if ( imageFile.match(/^\/images/) ) {
				bits = imageFile.split('/')
				bits[0] = 'public';
				var realImageFile = bits.join('/')
				var imageDimensions = getSize(realImageFile)
				attributes.width = imageDimensions.width;
				attributes.height = imageDimensions.height;
			}

			for ( var overriddenImageName in imageOverrides ) {
				if ( imageFile.includes(overriddenImageName) ) {
					attributes.width = imageOverrides[overriddenImageName].width;
					attributes.height = imageOverrides[overriddenImageName].height;
					attributes.layout = imageOverrides[overriddenImageName].layout;
				}
			}

			// For some reason "$('<amp-img/>', attributes);" does not work.
			var ampImage = $('<amp-img/>');
			ampImage.attr(attributes);
			image.replaceWith(ampImage)
		});

		var ampHTML = $.html()
		return ampHTML
	}

	var toAmp = function(html){
		html = imgToAmpImg(html)
		html = stripInlineStyles(html)
		return html
	}

	return {
		toAmp,
		stripInlineStyles,
		imgToAmpImg,
		renderAMP,
		getSize
	}
}

