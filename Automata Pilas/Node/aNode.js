class aNode {
	nextNodes = [];
	callback = function (char) {};

	constructor(name) {
		this.name = name;
	}

	evaluateChar(char, stack) {
		let next = [];
		this.nextNodes.forEach((transition) => {
			if (
				transition.input.includes(char) ||
				transition.input.includes("Σ")
			) {
				if (
					transition.stack.includes(stack) ||
					transition.stack.includes("Σ")
				) {
					next.push(transition.node);

					// Run transition callback
					transition.callback();
				}
			}
		});

		// Run node callback
		this.callback(char);

		// If not moving, then set next to self
		if (next.length == 0) {
			next.push(this);
		}

		// Return duplicate-free array
		return [...new Set(next)];
	}
}

module.exports = aNode;