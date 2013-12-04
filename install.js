var bower = require('bower');

// install the required libraries with bower
bower.commands
.install(['bootstrap', 'font-awesome', 'bootswatch'])
.on('end', function (installed) {
	console.log('Bower installed the following:', installed);
});