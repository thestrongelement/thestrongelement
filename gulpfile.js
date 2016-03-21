var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var del = require('del');
var browserSync = require('browser-sync');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

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
    .pipe(reload())
});

gulp.task('scripts', function(){
  var b = browserify({
  	debug: false	
  });
  b.add('./src/js/app.js');
  return b.bundle().on('error', handleError)
    .pipe(source('thestrongelement.js'))
    .pipe(gulp.dest(output + '/js'))
    .pipe(reload())
});

gulp.task('build', function (done) {
  runSequence('clean', 'public', 'scripts', 'html', function () {
  	done();
  	console.log('thestrongelement.com v' + pkg.version + ' build is complete.')
  });
});

gulp.task('watch', function() {
  gulp.watch('src/**/*.html', ['html']);
  gulp.watch('src/**/*.css', ['html']);
  gulp.watch('src/js/**/*.js', ['scripts']);
});

gulp.task('serve', ['watch'], function () {
  server = browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: [output],
      routes: {
        '/bower_components': 'bower_components'
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
  runSequence('build', 'serve', function () {
  	done();
  	console.log('thestrongelement.com v' + pkg.version + ' is running.')
  });
});

function reload() {
  if (server) {
    return browserSync.reload({ stream: true });
  }
  return $.util.noop();
}
function handleError(err) {
  console.log(err.toString());
  this.emit('end');
}
