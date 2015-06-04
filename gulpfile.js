var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var del = require('del');
var browserSync = require('browser-sync');
var server;

var src = 'src';
var output = 'www';
var pkg = require('./package.json');

// process static files
gulp.task('public', function() {
	return gulp.src('public/**/*')
		.pipe(gulp.dest(output));
});

gulp.task('clean', function (done) {
  del([output], done);
});

gulp.task('html', function() {
  var assets = $.useref.assets({searchPath: ['src', '.']});
	return gulp.src('src/**/*.html')
    .pipe(assets)
    .pipe(assets.restore())
    .pipe($.useref())
		.pipe(gulp.dest(output))
});

gulp.task('build', function (done) {
  runSequence('clean', 'public', 'html', function () {
  	done();
  	console.log('thestrongelement.com v' + pkg.version + ' build is complete.')
  });
});

gulp.task('serve', function () {
  server = browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: [src],
      routes: {
        '/bower_components': ''
      }
    }
  });
});

  
gulp.task('deploy', ['build'], function () {
	var opts = {
		host: 'thestrongelement.com',
		auth: 'keyMain',
		remotePath: 'thestrongelement.com/www'
	}
	return gulp.src([ output +'/**/*'])
		.pipe($.sftp(opts));
});

gulp.task('default', function (done) {
  gulp.start('build');
  gulp.start('serve');
  
});
