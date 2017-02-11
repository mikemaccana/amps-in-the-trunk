// Tests. Mocha TDD/assert style. See
// http://visionmedia.github.com/mocha/
// http://nodejs.org/docs/latest/api/assert.html

var parentDir = __dirname,
	assert = require('assert'),
	fs = require('fs'),
	ampsInTheTrunk = require('../index.js')(),
	dedent = require('dedent-js'),
	log = console.log.bind(console);

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
		var actual = ampsInTheTrunk.imgToAmpImg(html).replace(".*");
		// Slightly wonky indentation on result but that's cosmetic only
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

suite('strips inline styles', function(){
	test('strips inline styles', function(){
		var html = dedent(`
			<h2 style="color: green;">
					Woo I am a heading!
				</h2>
		`)
		var actual = ampsInTheTrunk.stripInlineStyles(html).replace(".*");
		// Slightly wonky indentation on result but that's cosmetic only
		var expected = dedent(`
		<h2>
				Woo I am a heading!
			</h2>`)
		assert.deepEqual(actual, expected)
	})
});

suite('syntax highlighting', function(){
	test('works', function(){
		var html = dedent(`
		<pre>
				<code>
					console.log('Yolo swag')
				</code>
			</pre>
		`)
		var actual = ampsInTheTrunk.highlightCode(html);
		var expected = dedent(`
		<pre>
				<code class="hljs">
					console.log(<span class="hljs-variable">&amp;apos</span>;Yolo swag<span class="hljs-variable">&amp;apos</span>;)
				</code>
			</pre>
		`)
		assert.deepEqual(actual, expected)
	})
})
