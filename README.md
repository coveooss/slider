[![Build Status](https://img.shields.io/travis/coveo/styleguide.svg?style=flat-square)](https://travis-ci.org/coveo/slider)
[![Coverage Status](https://coveralls.io/repos/coveo/slider/badge.svg?style=flat-square&branch=master&service=github)](https://coveralls.io/github/coveo/slider?branch=master)
[![dev-dependencies](https://img.shields.io/david/dev/coveo/styleguide.svg?style=flat-square)](https://github.com/coveo/slider/blob/master/package.json)
[![license](http://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/coveo/slider/blob/master/LICENSE)

# Coveo Slider
Coveo Slider is an enhanced HTML5 input range. 

It's available on npm `npm install coveo-slider`

This project is still its early stage and feature will be added when needed

##Dependencies
You need to include [jQuery](https://jquery.com/) and [Underscore](http://underscorejs.org/) for this to work.

## Contributing
Make sure you have Node JS and NPM installed.
Run `npm install` to get the required dependencies.

### Building
To build the project simply run `npm start` or `gulp` if you have gulp installed as a global dependency.

### Test locally
Feel free to modify the index.html file in the dist folder to test your feature.

We use Karma & Jasmine to run automated tests. The coverage is provided by instanbul via karma-coverage plugin.
To run the tests, you can use `npm test` or `gulp test`. Please add some unit tests if you make a PR.

# License
Coveo Slider is distributed under [MIT license](https://github.com/Coveo/slider/blob/master/LICENSE).
