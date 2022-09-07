const xlsxFile = require("read-excel-file/node");
const bodyParser = require("body-parser");
const readline = require("readline");
const express = require("express");
const aNode = require("./aNode.js");
const path = require("path");
const fs = require("fs");
const app = express();

const http = require("http").createServer(app);
const webPort = 8080;

const excelPath = path.join(__dirname, "archivos", "ajedrez.xlsx");

var transitionTree;
var stack = [];

// EJS INIT
// Set the view engine to ejs
app.set("view engine", "ejs");
// Set ejs files path
app.set("views", __dirname + "/dist/pages");
// Set body parser
app.use(bodyParser.urlencoded({ extended: true }));

// REQUESTS
app.get("/", (req, res) => {
	res.render("index");
});

app.post("/procesar/cadena/", (req, res) => {
	let response = {};
	let output;

	if (req.body.input.length == 0) {
		req.body.input = generateBin(10);
	}

	output = automata(req.body.input);

	console.log(output);

	response = output.response;
	response.binario = req.body.input;

	fs.writeFile("./archivos/proceso.txt", output.file, () => {});

	// Send response
	res.send(JSON.stringify(response));
});

function generateBin(len) {
	let resultado = "";
	for (let i = 0; i < len; ++i) {
		resultado += Math.floor(Math.random() * 2);
	}
	return resultado;
}

// AUTOMATA
// Main automata functionality
function automata(cadena) {
	let limi = cadena.length;
	let current, next;
	let response = {
		animations: [],
	};
	let result = {
		file: "",
	};

	stack = [];
	stack.push("F");

	current = [startNode];
	response.animations.push({
		nodeName: current[0].name,
		input: cadena,
		stack: stack.join(""),
	});

	result.file += `d(${current[0].name}, ${cadena}, ${stack.join("")})`;
	for (let i = 0; i < limi; ++i) {
		next = [];
		current.forEach((nodo) => {
			next = next.concat(
				nodo.evaluateChar(cadena[i], stack[stack.length - 1])
			);
		});

		// Removing duplicates
		current = [...new Set(next)];

		// Set animation output
		response.animations.push({
			nodeName: current[0].name,
			input:
				cadena.substring(i + 1).length == 0
					? "e"
					: cadena.substring(i + 1),
			stack: stack.join(""),
		});

		//Set file output
		result.file += `->\nd(${current[0].name}, ${cadena.substring(
			i
		)}, ${stack.join("")})`;
	}

	// Process remaining stack things
	limi = stack.length;
	for (let i = 0; i < limi; ++i) {
		next = [];
		current.forEach((nodo) => {
			next = next.concat(nodo.evaluateChar("Φ", stack[i]));
		});

		// Removing duplicates
		current = [...new Set(next)];

		// Set animation output
		response.animations.push({
			nodeName: current[0].name,
			input: "e",
			stack: stack.join("").substring(i + 1),
		});

		//Set file output
		result.file += `->\nd(${current[0].name}, e, ${stack.join("")})`;
	}

	if (current[0].name == "qf") {
		response.result = "La cadena es válida!"
	} else {
		response.result = "La cadena no es válida :c"
	}

	// Add animation list
	result.response = response;

	return result;
}

// Create automata
function initAutomata() {
	startNode = new aNode("q0");
	let q1 = new aNode("q1");
	let q2 = new aNode("qf");

	q2.callback = (char) => {
		// Input was valid
		console.log("Input was valid");
	};

	q1.nextNodes.push({
		input: "Φ",
		stack: "F",
		node: q2,
		callback: () => {},
	});
	q1.nextNodes.push({
		input: "1",
		stack: "Σ",
		node: q1,
		callback: () => {
			// Pop from stack
			stack.pop();
		},
	});

	startNode.nextNodes.push({
		input: "0",
		stack: "Σ",
		node: startNode,
		callback: () => {
			// Push 'a' to stack
			stack.push("a");
		},
	});
	startNode.nextNodes.push({
		input: "1",
		stack: "Σ",
		node: q1,
		callback: () => {
			// Pop from stack
			stack.pop();
		},
	});
}

// SERVER SET-UP
app.use(express.static(__dirname + "/dist/public/"));

// SERVER LISTEN INIT
http.listen(webPort, () => {
	console.log("Listening on port: " + webPort);
});

// Init
initAutomata();
