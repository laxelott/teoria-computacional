const grafo = require("./modules/grafo");
const readline = require("readline");
const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();

const http = require("http").createServer(app);
const webPort = 8080;

const pathDiccionario = path.join(
	__dirname,
	"..",
	"archivos",
	"diccionario.txt"
);
const pathPrettyTree = path.join(__dirname, "..", "archivos", "tree.json");
const pathCounter = path.join(__dirname, "..", "archivos", "contador.txt");
const pathProceso = path.join(__dirname, "..", "archivos", "proceso.txt");
const pathChart = path.join(__dirname, "..", "archivos", "chart.json");
const pathInput = path.join(__dirname, "..", "archivos", "input.txt");

let treantTree = {};
let counter = {};
let q0;
let io;

// EJS INIT
// Set the view engine to ejs
app.set("view engine", "ejs");
// Set ejs files path
app.set("views", __dirname + "/../dist/pages");

// REQUESTS
app.get("/", (req, res) => {
	res.render("index");
});
app.get("/get/tree/", (req, res) => {
	res.end(JSON.stringify(treantTree));
});
app.get("/generate/tree", (req, res) => {
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

// NODE CREATOR
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

// MAIN AUTOMATA
async function processFile() {
	const readable = readline.createInterface({
		input: fs.createReadStream(pathInput, { encoding: "utf8" }),
	});
	const writeStream = fs.createWriteStream(pathProceso);
	let currentNodes = [q0];
	let nextNodes;
	let progress;
	let message;
	let limi;

	console.log(`Reading file ${pathInput}...`);

	for await (let line of readable) {
		// Add space to end of the line
		line += " ";
		limi = line.length;

		for (let i = 0; i < limi; ++i) {
			// Empty needed arrays
			nextNodes = [];
			message = [];

			// Reset progress
			progress = `(${line[i]})=>\n`;

			// Process all steps at the 'same time'
			currentNodes.forEach((node) => {
				// Add q0 to everything
				nextNodes.push(q0);

				// Add the rest of nodes
				nextNodes.push(
					node.process(line[i], q0, (node, char, next) => {
						// Append progress to variable
						progress += `\t${node.name} -> ${next}\n`;

						// If it's an end node, add to counter
						if (node.end) {
							// If counter is nonexistant, create it
							if (typeof counter[node.name] == "undefined") {
								counter[node.name] = 0;
							}

							// Add to counter
							++counter[node.name];

							// Register counter
							progress += `\t\t${node.name} +1\n`;
						}

						// Add to GUI list
						message.push({
							currentChar: char,
							nodeIsEnd: node.end,
							nodeStart: node.name,
							nodeEnd: next,
						});
					})
				);
			});

			// Write current step to web GUI
			io.sockets.emit("update", JSON.stringify(message));

			// Update counter on file
			writeCounter();

			// Write progress to file
			writeStream.write(progress);

			// Set the next nodes to be processed while also removing duplicate nodes
			currentNodes = [...new Set(nextNodes)];
		}
	}

	console.log("Done reading file!");
	writeStream.close();
}
function removeDuplicateNodes(nodeArray) {
	nodeArray.forEach((nodeArray) => {});
}
function writeCounter() {
	fs.writeFile(pathCounter, JSON.stringify(counter, null, 4), function () {});
}

// TREE FUNCTIONALITY
async function generateTree() {
	const readable = readline.createInterface({
		input: fs.createReadStream(pathDiccionario, { encoding: "utf8" }),
	});
	let fileTree;

	console.log("Generating tree from " + pathDiccionario);

	// Generate origin node
	q0 = new grafo.QNode("q0", "\0");

	// Create a node line for each word
	for await (let line of readable) {
		q0 = addNode(q0, line, line);
	}

	fileTree = fs.createWriteStream(pathPrettyTree);
	fileTree.write(JSON.stringify(q0, null, 4));
	fileTree.close();
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

// INITIALIZERS
function initSocket() {
	io = require("socket.io")(http);

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

	console.log(`Socket ready on ${http}`);
}
async function initTrees() {
	// READ TREE SOURCE FILE
	await generateTree();
	generateTreantTree();
	processFile();
}

// SERVER SET-UP
app.use(express.static(__dirname + "/../dist/public/"));

// INITIALIZE THINGS
initSocket();
initTrees();

// SERVER LISTEN INIT
http.listen(webPort, () => {
	console.log("Listening on port: " + webPort);
});
