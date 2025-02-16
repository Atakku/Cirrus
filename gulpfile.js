const gulp = require('gulp');
const prop = require('./package.json');
const minify = require('gulp-clean-css');
const sass = require('gulp-sass');
sass.compiler = require('sass'); // Use Dart Sass
const $ = require('gulp-load-plugins')();
const head =
    '/*\r\n* Cirrus ' +
    prop.version +
    `\r\n* Stanley Lim, Copyright ${new Date().getFullYear()}\r\n* https://spiderpig86.github.io/Cirrus\r\n*/\r\n`;

const environment = {
    isCi: process.env.CI ?? false, // Github actions default variable is always set to true
}

gulp.task('compile', () => {
    return gulp
        .src(['src/ext.scss'])
        .pipe(sass.sync().on('error', function (err) {
            sass.logError.call(this, err);

            // Fail job if in CI
            if (environment.isCi) {
                throw err;
            }
        }))
        .pipe($.concat('cirrus.css'))
        .pipe($.header(head))
        .pipe($.size())
        .pipe(gulp.dest('./dist/'))
        .on('error', (err) => {
            console.error(err);
            process.exit(1);
        });
});

gulp.task(
    'minify',
    gulp.series('compile', () => {
        return gulp
            .src(['./dist/cirrus.css'])
            .pipe(
                minify(
                    {
                        level: {
                            1: {
                                all: true,
                                normalizeUrls: false,
                            },
                            2: {
                                all: false,
                                removeDuplicateRules: true,
                                reduceNonAdjacentRules: true,
                                removeDuplicateFontRules: true,
                                removeDuplicateMediaBlocks: true,
                                mergeAdjacentRules: true,
                                mergeIntoShorthands: true,
                                mergeMedia: true,
                                mergeNonAdjacentRules: true,
                                mergeSemantically: false,
                                removeEmpty: true,
                            },
                        },
                    },
                    (details) => {
                        console.log('FULL');
                        console.log(details.name + ': ' + details.stats.originalSize);
                        console.log(details.name + '-min: ' + details.stats.minifiedSize);
                    }
                )
            )
            .pipe($.header(head))
            .pipe($.size())
            .pipe($.concat('cirrus.min.css'))
            .pipe(gulp.dest('./dist/'))
            .on('error', (err) => {
                console.error('Error encountered during build. Failing.');
                process.exit(1);
            });
    })
);

gulp.task('core', () => {
    return gulp
        .src(['src/core.scss'])
        .pipe(sass.sync().on('error', sass.logError))
        .pipe($.concat('cirrus-core.css'))
        .pipe($.header(head))
        .pipe($.size())
        .pipe(gulp.dest('./dist/'));
});

gulp.task(
    'minify-core',
    gulp.series('core', () => {
        return gulp
            .src(['./dist/cirrus-core.css'])
            .pipe(
                minify(
                    {
                        level: {
                            1: {
                                all: true,
                                normalizeUrls: false,
                            },
                            2: {
                                all: false,
                                removeDuplicateRules: true,
                                reduceNonAdjacentRules: true,
                                removeDuplicateFontRules: true,
                                removeDuplicateMediaBlocks: true,
                                mergeAdjacentRules: true,
                                mergeIntoShorthands: true,
                                mergeMedia: true,
                                mergeNonAdjacentRules: true,
                                mergeSemantically: false,
                                removeEmpty: true,
                            },
                        },
                    },
                    (details) => {
                        console.log('CORE');
                        console.log(details.name + ': ' + details.stats.originalSize);
                        console.log(details.name + '-min: ' + details.stats.minifiedSize);
                    }
                )
            )
            .pipe($.header(head))
            .pipe($.size())
            .pipe($.concat('cirrus-core.min.css'))
            .pipe(gulp.dest('./dist/'));
    })
);

gulp.task('watch', () => gulp.watch('./src/**/*.scss', gulp.parallel('minify', 'minify-core')));

gulp.task('default', gulp.parallel('minify', 'minify-core'));
