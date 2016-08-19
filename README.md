# A module to transform HTML directly to Google AMP HTML

amps-in-the-trunk will go through your HTML, use the DOM to change `<img>` into `<amp-img>` and add missing height / width stats.

<img src="https://circleci.com/gh/mikemaccana/amps-in-the-trunk.svg?&style=shield&circle-token=8edd090fbaec0dd6d5d9345145f7c890b4bf56f0"/>

## How to use with express.js (and how to do the bits this module doesn't)

So the main things with AMP for me were:

 - No script tags (except the AMP script tag)
 - CSS needs to be included in the HTML
 - No inline style attributes (most web developers don't use these, but some libraries eg for markdown generation putput them)
 - Images always need height and width

Most apps use a templating engine to generate their HTML. So as a developer:

 - Use a different layout that:
	 - doesn't have all the usual analytics `<script>` tags
	 - inlines all stylesheets
 - Take the HTML generated by your templating engine and use amps-in-the-trunk to turn HTML into AMP HTML.

So you're using express, this looks like

 - Use `layout=` to specify the AMP layout rather than your normal one
 - Provide a callback to `res.render()` to allow us to intercept the rendered HTML and convert it to AMP:

<!-- http://meta.stackexchange.com/questions/34292/code-blocks-after-a-list-but-not-within-a-list-in-markdown-is-it-possible -->

	// Load the module and pass in any overrides
	var ampsInTheTrunk = require('amps-in-the-trunk')()

	// Enable the renderAMP Express middleware
	app.use(ampsInTheTrunk.renderAMP);

	// Handle a route by respondingwith an AMP page
	router.get('/blog', function(req, res){
		res.renderAMP('blog-index', {
			'title': 'My Blog',
			inlineStyles,
			styles: [ 'style', 'articles']
		});
	});

## SVGs aren't sized correctly, or I want a different layout for an image

amps-in-the-trunk sets images to `responsive` by default. You can change that with `imageOverrides`. Also most SVGs have incorrect sizing. You could fix the SVGs, or you could override them with `imageOverrides`.

	var imageOverrides = {
		'logo.svg': {
			width: 22,
			height: 22,
			layout: 'fixed'
		},
		'rss.svg': {
			width: 26,
			height: 16,
			layout: 'fixed'
		}
	}

	var ampsInTheTrunk = require('amps-in-the-trunk')(imageOverrides)

## Why another AMP module?

I tried [html-to-amp](https://www.npmjs.com/package/html-to-amp) but that uses [html-to-article-json](https://www.npmjs.com/package/html-to-amp) first and it lost images. I don't care about `article.json` and I don't care about non-AMP alternative formats. I just wanted an AMP version of my HTML that didn't lose any data and would pass the AMP validator.

## Pull requests welcome

This is the first version of the module, created really for my own needs. I'm quite happy to take pull requests for additional features.

## Why the name?

Because `amplify` and `html-to-amp` were taken and because [House of Pain](https://www.youtube.com/watch?v=KZaz7OqyTHQ)
