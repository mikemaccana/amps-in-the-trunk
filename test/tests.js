// Tests. Mocha TDD/assert style. See
// http://visionmedia.github.com/mocha/
// http://nodejs.org/docs/latest/api/assert.html

var parentDir = __dirname,
	assert = require('assert'),
	fs = require('fs'),
	ampsInTheTrunk = require('../index.js')(),
	dedent = require('dedent'),
	log = console.log.bind(console)

suite('amp-img tags', function(){

	test('makes img tags into amp-img tags', function(){
		var testImage = parentDir+'/ferret.gif';
		var stats = fs.statSync(testImage);
		var html = dedent(`
			<div>
				<p>
					I've gone into full girl meltdown.
				</p>

				<img src="`+testImage+`"/>
			</div>
		`)
		var actual = ampsInTheTrunk.toAmp(html).replace(".*");
		var expected = dedent(`
		<div>
				<p>
					I&apos;ve gone into full girl meltdown.
				</p>

				<amp-img layout="responsive" alt="an image" src="${ __dirname }/ferret.gif"></amp-img>
			</div>`)
		assert.deepEqual(actual, expected)
	});

})
