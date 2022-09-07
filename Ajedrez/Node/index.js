const xlsxFile = require("read-excel-file/node");
const bodyParser = require("body-parser");
const readline = require("readline");
const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();

const http = require("http").createServer(app);
const webPort = 8080;

const excelPath = path.join(__dirname, "archivos", "ajedrez.xlsx");

var transitionTree;

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

	if (!req.body.auto) {
		if (req.body.input.length == 0) {
			req.body.input = generateMoves(20);
		}
	} else {
		req.body.input = generateMoves(10);
	}

	output = automata(req.body.input, 1, 16);

	response.moves = req.body.input;
	response.animations = output.animations;
	response.winner = output.winner;

	if (output.winner) {
		result.message = "Cadena ganadora!";
		fs.writeFile("./archivos/ganadores.txt", cadena, () => {});
	}

	// Send response
	res.send(JSON.stringify(response));
});

function generateMoves(num) {
	let resultado = "";
	for (let i = 0; i < num; ++i) {
		resultado += Math.floor(Math.random() * 2) == 1 ? "r" : "b";
	}
	return resultado;
}

// AUTOMATA
// Main automata functionality
function automata(cadena, startNode, winNode) {
	let current, next;
	let animations = [];
	let result = {};

	current = [startNode];
	animations.push(current);

	cadena.split("").map((currentChar) => {
		next = [];
		current.forEach((nodo) => {
			next = next.concat(processNode(currentChar, nodo));
		});

		// Removing duplicates
		current = [...new Set(next)];

		// Adding step to animation queue
		animations.push(current);
	});

	// Check if winning condition
	result.winner = current.includes(winNode);

	// Add animation list
	result.animations = animations;

	return result;
}
// Node processing
function processNode(currentChar, nodeName) {
	let resultado = [];

	transitionTree.forEach((transition) => {
		if (transition.nombre == nodeName) {
			transition.pasos.forEach((paso) => {
				if (paso.origen == currentChar) {
					resultado = resultado.concat(paso.destinos);
				}
			});
		}
	});

	return resultado;
}
// Generate transition tree
function generateTree() {
	xlsxFile("./table.xlsx").then((rows) => {
		transitionTree = [];

		// Removing first row
		rows.shift();

		// Add a transition for each row
		rows.forEach((row) => {
			transitionTree.push({
				nombre: row[0],
				pasos: [
					{
						origen: "r",
						destinos: row[1]
							.toString()
							.split(",")
							.map((x) => +x),
					},
					{
						origen: "b",
						destinos: row[2]
							.toString()
							.split(",")
							.map((x) => +x),
					},
				],
			});
		});
	});
}

// SERVER SET-UP
app.use(express.static(__dirname + "/dist/public/"));

// SERVER LISTEN INIT
http.listen(webPort, () => {
	console.log("Listening on port: " + webPort);
});

// Init
generateTree();
