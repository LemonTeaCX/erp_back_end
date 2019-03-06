class Util {
	constructor(options) {}
	copyJson(json) {
		return JSON.parse(JSON.stringify(json));
	}
}
module.exports = Util;
