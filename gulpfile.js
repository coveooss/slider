const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const gulp = require('gulp');
const karma = require('karma').Server;
const merge = require('merge2');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const typescript = require('gulp-typescript');
const uglify = require('gulp-uglify');

const csscomb = require('gulp-csscomb');
const isCIBuild = process.env.CI;

const tsProject = typescript.createProject('tsconfig.json');

gulp.task('ts:compile', function () {
    const tsResult = gulp.src([
        './src/**/*.ts'])
        .pipe(sourcemaps.init())
        .pipe(tsProject());

    return merge([
        tsResult.js
            .pipe(concat('Coveo.Slider.js'))
            .pipe(sourcemaps.write('./dist/js/'))
            .pipe(gulp.dest('./dist/js/')),
        tsResult.dts
            .pipe(gulp.dest('./dist/js/'))
    ]);
});

gulp.task('ts', gulp.series('ts:compile', function () {
    return gulp.src('./dist/js/Coveo.Slider.js')
        .pipe(uglify())
        .pipe(rename('Coveo.Slider.min.js'))
        .pipe(gulp.dest('./dist/js/'))
}));

const tsTestProject = typescript.createProject({
    declarationFiles: false,
    target: 'ES5',
    outDir: 'specs',
    noEmitOnError: false
});

gulp.task('test:compile', function () {
    return merge([
        gulp.src([
            './dist/js/Slider.d.ts',
            './src/Slider.d.ts',
            './specs/**/*.ts'], {cwd: './'})
            .pipe(tsTestProject())
            .pipe(gulp.dest('./specs'))
    ]);
});

gulp.task('test', gulp.series('test:compile', function (done) {
    const config = {
        configFile: __dirname + '/karma.conf.js'
    };

    if (isCIBuild) {
        config.reporters = ['mocha', 'coverage', 'coveralls'];
    }

    new karma(config).start().then(done);
}));

gulp.task('sass:format', function () {
    return gulp.src(['./scss/**/*.scss'])
        .pipe(csscomb())
        .pipe(gulp.dest('./scss'));
});

gulp.task('sass', gulp.series('sass:format', function () {
    return gulp.src(['./scss/**/*.scss'])
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['Chrome >= 23', 'Firefox >= 21', 'Explorer >= 10', 'Opera >= 15', 'Safari >= 6']
        }))
        .pipe(rename('Coveo.Slider.css'))
        .pipe(sourcemaps.write('../css'))
        .pipe(gulp.dest('./dist/css'))
}));

gulp.task('watch', function () {
    gulp.watch('./src/**/*.ts', ['ts']);
    gulp.watch('./test/src/**/*.ts', ['test:compile']);
    gulp.watch('./scss/**/*.scss', ['sass']);
});

gulp.task('default', gulp.series('ts', 'sass', 'test'));
