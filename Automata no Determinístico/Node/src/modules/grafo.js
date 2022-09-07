// Basic graph node
class QNode {
	constructor(name, origin, end = false) {
		this.name = name;
		this.origin = origin;
		this.children = {};
		this.end = end;
	}

	process(char, defaultNode, callback = () => {}) {
		let next = defaultNode;

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

module.exports = { QNode };