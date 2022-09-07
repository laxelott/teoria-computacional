const express = require("express");
const http = require("http");
const app = express();

const server = http.createServer(app);
const webPort = 8080;

const modules = {
	automata: {
		app: require("./automata"),
		path: "/afd"
	}
};

modules.automata.app.initSockets(server);
modules.automata.app.initTree();

// SERVER SET-UP
app.use(express.static(__dirname + "/../dist/public"));
for (let key of Object.keys(modules)) {
	console.log(key);
	app.use(modules[key].path, modules[key].app);
}

// SERVER LISTEN INIT
server.listen(webPort, () => {
	console.log("Listening on port: " + webPort);
});
