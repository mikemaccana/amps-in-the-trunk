var cheerio = require('cheerio'),
	sizeOf = require('image-size');

// See README for imageOverrides format
module.exports = function(imageOverrides){

	imageOverrides = imageOverrides || {};

	var cache = {}

	var getSize = function(imageFile){
		var cachedDimensions = cache[imageFile]
		if ( cachedDimensions ) {
			return cachedDimensions
		}
		var dimensions = sizeOf(imageFile)
		cache[imageFile] = dimensions;
		return dimensions;
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
		return html
	}

	return {
		toAmp,
		getSize
	}
}

