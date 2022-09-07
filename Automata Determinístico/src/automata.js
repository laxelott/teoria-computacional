const grafo = require("./modules/grafo");
const readline = require("readline");
const app = require("express")();
const path = require("path");
const fs = require("fs");

const pathDiccionario = path.join(__dirname, "..", "diccionario.txt");
const pathProceso = path.join(__dirname, "..", "proceso.txt");
const pathChart = path.join(__dirname, "..", "chart.json");
const pathInput = path.join(__dirname, "..", "input.txt");
const pathTree = path.join(__dirname, "..", "tree.json");

let treantTree = {};
let counter = {};
let q0;
let io;

// Set the view engine to ejs
app.set("view engine", "ejs");
// Set views path
app.set("views", __dirname + "/../dist/pages");

// REQUESTS
app.get("/", (req, res) => {
	res.render("index");
});
app.get("/get/tree/", (req, res) => {
	res.end(JSON.stringify(treantTree));
});
app.post("/generate/tree", (req, res) => {
	var response = {
		valid: false,
		message: "Archvio no encontrado!",
	};

	// Check if it exists
	try {
		if (fs.existsSync(pathDiccionario)) {
			response.valid = true;
			response.message = "Archivo cargado!";
		}
	} catch (err) {}

	res.end(JSON.stringify(response));

	generateTree();
	generateTreantTree();
});
app.get("/start/", (req, res) => {
	res.end(
		JSON.stringify({
			start: true,
		})
	);
	processFile();
});

// Recursively adds a node
function addNode(node, word, value) {
	let nodeName = value.substring(0, value.length - (word.length - 1));

	if (word.length == 1) {
		node.children[word] = new grafo.QNode(value, word, true);
	} else {
		// If child does not exist, create it.
		if (typeof node.children[word[0]] == "undefined") {
			node.children[word[0]] = new grafo.QNode(
				nodeName,
				word.substring(0, 1)
			);
		}

		// Add children node
		node.children[word[0]] = addNode(
			node.children[word[0]],
			word.substring(1),
			value
		);
	}
	return node;
}

async function processFile() {
	const readable = readline.createInterface({
		input: fs.createReadStream(pathInput, { encoding: "utf8" }),
	});
	const writeStream = fs.createWriteStream(pathProceso);
	let currentNode = q0;
	let message = {};
	let limi;
	let progreso;

	console.log(`Reading file ${pathInput}`);

	for await (let line of readable) {
		line += "  ";
		limi = line.length;

		for (let i = 0; i < limi; ++i) {
			// Node process
			currentNode = currentNode.process(
				line[i],
				q0,
				(node, char, next) => {
					progreso = `${node.name}(${char}) -> ${next}\n`;
					writeStream.write(progreso);

					if (node.end) {
						if (typeof counter[node.name] == "undefined") {
							counter[node.name] = 0;
						}
						++counter[node.name];
						writeCounter();
					}

					message.process = char;
					message.nodeName = node.name;
					message.nodeEnd = node.end;

					console.log(JSON.stringify(message, null, 4));
					io.sockets.emit("update", JSON.stringify(message));
				}
			);
		}
	}

	writeStream.close();
}
function writeCounter() {
	fs.writeFile(
		"/../contador.txt",
		JSON.stringify(counter, null, 4),
		function () {}
	);
}

async function generateTree() {
	const readable = readline.createInterface({
		input: fs.createReadStream(pathDiccionario, { encoding: "utf8" }),
	});
	let pathtree;
	
	console.log("Generating tree from " + pathDiccionario);
	q0 = new grafo.QNode("Origen", "\0");

	for await (let line of readable) {
		q0 = addNode(q0, line, line);
	}

	pathtree = fs.createWriteStream(pathTree);
	pathtree.write(JSON.stringify(q0, null, 4));
	pathtree.close();
}
function generateTreantTree() {
	treantTree.chart = JSON.parse(fs.readFileSync(pathChart));

	treantTree.nodeStructure = getGraphNode(q0);
}
function getGraphNode(node) {
	let result = {};
	let children = [];
	result.text = {
		name: node.name,
	};
	if (node.end) {
		result.HTMLclass = "node-end";
	}

	for (let [key, val] of Object.entries(node.children)) {
		children.push(getGraphNode(val));
	}

	result.children = children;
	return result;
}

app.initSockets = function (server) {
	io = require("socket.io")(server);

	io.path("/afd");

	// WEB SOCKET
	io.on("connection", (socket) => {
		var data = {
			event: "handshake",
			data: "Hola! C:",
		};

		console.log("Conexión a socket!");
		socket.emit("handshake", JSON.stringify(data));
	});

	console.log(io.path());

	console.log(`Socket ready on ${server}`);

};
app.initTree = async function () {
	// READ TREE SOURCE FILE
	await generateTree();
	generateTreantTree();
	processFile();
};

module.exports = app;
