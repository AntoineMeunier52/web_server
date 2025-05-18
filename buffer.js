/*
use a dynamic Buffer to avoid using Buffer.concat()
Because with Buffer.concat()
	the old data is copied
*/

class DynBuf {
	constructor(size) {
		mainBuf = Buffer.alloc(size);
		length = this.mainBuf.length;
	}

	pushBuf(data) {
		const newLen = this.length + data.length;
		if (this.mainBuf.length < newLen) {
			let cap = Math.max(this.mainBuf.length, 32);
			while (cap < newLen) {
				cap *= 2;
			}
			const grown = Buffer.alloc(cap);
			this.mainBuf.copy(grown, 0, 0);
			this.mainBuf = grown;
		}
		data.copy(this.mainBuf, this.length, 0);
		this.length = newLen;
	}
}

export {
	DynBuf
}