const express = require("express");
const fs = require("fs");
const sanitize = require("sanitize")();
const readline = require("readline");

const app = express();
const webPort = 8080;
const diccionario = "./diccionario.txt";
const archivoFuente = "./archivo.txt";
let q0;
let JSONTreantTree = {};
let counter = {};

const http = require("http").createServer(app);
const io = require("socket.io")(http);

// Set the view engine to ejs
app.set("view engine", "ejs");
// Set views path
app.set("views", __dirname + "/../dist/pages");

// SERVER SET-UP
app.use(express.static("dist/public"));

// REQUESTS
// "static" pages
app.get("/", (req, res) => {
	res.render("index");
});
app.get("/graph-tree/", (req, res) => {
	res.end(JSON.stringify(JSONTreantTree));
});
app.get("/start/", async (req, res) => {
	res.end(
		JSON.stringify({
			start: true,
		})
	);
	console.log("Starting...");
	await processFile();
});
// Get filename and path
app.post("/set/path/", (req, res) => {
	archivoFuente = req.query.filepath;
	var response = {
		valid: false,
		message: "Archvio no encontrado!",
	};

	// Check if it exists
	try {
		if (fs.existsSync(path)) {
			response.valid = true;
			response.message = "Archivo cargado!";
		}
	} catch (err) {}

	res.end(JSON.stringify(response));
});

// WEB SOCKET
io.on("connection", (socket) => {
	var data = {
		event: "handshake",
		data: "Hola! C:",
	};

	console.log("Conexion a socket!");
	socket.emit("handshake", JSON.stringify(data));
});
io.sockets.on("result", (data) => {
	console.log("Result!");
	console.log(JSON.parse(data));
});

// SERVER LISTEN INIT
http.listen(webPort, () => {
	console.log("Listening on port: " + webPort);
});

// Node Management
class QNode {
	constructor(name, origin, end = false) {
		this.name = name;
		this.origin = origin;
		this.children = {};
		this.end = end;
	}

	process(char, ifNot, callback = () => {}) {
		let next = ifNot;

		for (let [key, val] of Object.entries(this.children)) {
			if (key == char) {
				next = val;
				break;
			}
		}
		callback(this, char, next.name);
		return next;
	}
}

function generateTree() {
	console.log("Generating tree from " + diccionario);
	var lines = fs
		.readFileSync(diccionario, "utf-8")
		.replace(/\r/g, "")
		.split("\n")
		.filter(Boolean);

	q0 = new QNode("Origen", "\0");

	lines.forEach((line) => {
		q0 = addNode(q0, line, line);
	});
}

async function processFile() {
	const readable = readline.createInterface({
		input: fs.createReadStream(archivoFuente, { encoding: "utf8" }),
	});
	const writeStream = fs.createWriteStream("./proceso.txt");
	let currentNode = q0;
	let message = {};
	let limi;
	let progreso;

	readable.on("line", async function (line) {
		line.replace(/\r\n/gi, "");
		limi = line.length;

		console.log(line);
		for (let i = 0; i < limi; ++i) {
			console.log(line[i]);
			// Node process
			currentNode = currentNode.process(
				line[i],
				q0,
				(node, char, next) => {
					progreso = `${node.name}(${char}) -> ${next}\n`;
					console.log(progreso);
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
					console.log(message);

					io.sockets.emit("update", JSON.stringify(message));
				}
			);
		}
	});
}

// Recursively adds a node
function addNode(node, word, value) {
	let length;
	let nodeName = value.substring(0, value.length - (word.length - 1));

	if (word.length == 1) {
		node.children[word] = new QNode(value, word, true);
	} else {
		// If child does not exist, create it.
		if (typeof node.children[word[0]] == "undefined") {
			node.children[word[0]] = new QNode(nodeName, word.substring(0, 1));
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

function writeCounter() {
	fs.writeFile("./contador.txt", JSON.stringify(counter, null, 4), function() {});
}

function generateGraphTree() {
	JSONTreantTree.chart = JSON.parse(fs.readFileSync("src/chart.json"));

	JSONTreantTree.nodeStructure = getGraphNode(q0);
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

// READ TREE SOURCE FILE
generateTree();
generateGraphTree();
processFile();