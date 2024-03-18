var child_process = require('child_process');

function install(modules, callback) {
  if (modules.length == 0) {
    if (callback) callback(null);
    return;
  }
  var module = modules.shift();
  child_process.exec('npm install ' + module + ' --no-save --silent', {}, function (error, stdout, stderr) {
    process.stdout.write(stdout + '\n');
    process.stderr.write(stderr + '\n');
    if (error !== null) {
      if (callback) callback(error);
    } else {
      install(modules, callback);
    }
  });
}

function copyFiles(error) {
  if (!error) {
    child_process.exec('cp -a node_modules/@qlik-trial/sense-themes-default/dist/. apis/theme/src/themes/');
  }
  child_process.exec('git restore yarn.lock');
}

/* Example */

install(['@qlik-trial/sense-themes-default'], copyFiles);
