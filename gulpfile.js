var autoprefixer = require('gulp-autoprefixer');
var concat = require('gulp-concat');
var gulp = require('gulp');
var karma = require('karma').Server;
var merge = require('merge2');
var minifyCSS = require('gulp-minify-css');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var tslint = require('gulp-tslint');
var typescript = require('gulp-typescript');
var uglify = require('gulp-uglify');

var csscomb = require('gulp-csscomb');


var tslintConfig = require('./tslint.js').configuration;
var isCIBuild = process.env.CI;

gulp.task('ts:lint', function () {
    return gulp.src('./src/**/*.ts')
        .pipe(tslint({configuration: tslintConfig}))
        .pipe(tslint.report('prose', {
            summarizeFailureOutput: false
        }));
});

var tsProject = typescript.createProject('tsconfig.json', {typescript: require('typescript')});
gulp.task('ts:compile', function () {
    var tsResult = gulp.src([
        './typings/**/*.d.ts',
        '!./typings/tsd.d.ts',
        './src/**/*.ts'])
        .pipe(sourcemaps.init())
        .pipe(typescript(tsProject));

    return merge([
        tsResult.js
            .pipe(concat('Coveo.Slider.js'))
            .pipe(sourcemaps.write('./dist/js/'))
            .pipe(gulp.dest('./dist/js/')),
        tsResult.dts
            .pipe(gulp.dest('./dist/js/'))
    ]);
});
gulp.task('ts', ['ts:compile', 'ts:lint'], function () {
    gulp.src('./dist/js/Coveo.Slider.js')
        .pipe(uglify())
        .pipe(rename('Coveo.Slider.min.js'))
        .pipe(gulp.dest('./dist/js/'))
});


gulp.task('test', ['test:compile'], function () {
    var config = {
        configFile: __dirname + '/karma.conf.js'
    };

    if (isCIBuild) {
        config.reporters = ['mocha', 'coverage', 'coveralls'];
    }

    new karma(config).start();
});

var tsTestProject = typescript.createProject({
    declarationFiles: false,
    noExternalResolve: true,
    target: 'ES5',
    outDir: 'specs',
    noEmitOnError: false
});

gulp.task('test:compile', function () {
    return merge([
        gulp.src([
            '!./typings/tsd.d.ts',
            './typings/**/*.d.ts',
            './dist/js/Slider.d.ts',
            './src/Slider.d.ts',
            './specs/**/*.ts'], {cwd: './'})
            .pipe(typescript(tsTestProject))
            .pipe(gulp.dest('./specs'))
    ]);
});

gulp.task('sass', ['sass:format'], function () {
    return gulp.src(['./scss/**/*.scss'])
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['Chrome >= 23', 'Firefox >= 21', 'Explorer >= 10', 'Opera >= 15', 'Safari >= 6']
        }))
        .pipe(rename('Coveo.Slider.css'))
        .pipe(sourcemaps.write('../css'))
        .pipe(gulp.dest('./dist/css'))
});

gulp.task('sass:format', function () {
    return gulp.src(['./scss/**/*.scss'])
        .pipe(csscomb())
        .pipe(gulp.dest('./scss'));
});


gulp.task('watch', function () {
    gulp.watch('./src/**/*.ts', ['ts']);
    gulp.watch('./test/src/**/*.ts', ['test:compile']);
    gulp.watch('./scss/**/*.scss', ['sass']);
});

gulp.task('default', ['ts', 'sass', 'test'], function () {
});
