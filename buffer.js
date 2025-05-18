/*
use a dynamic Buffer to avoid using Buffer.concat()
Because with Buffer.concat()
	the old data is copied
*/

class DynBuf {
	constructor(size) {
		this.mainBuf = Buffer.alloc(size);
		this.length = this.mainBuf.length;
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

	popBuf(index) {
		this.mainBuf.copyWithin(0, index, this.length);
		this.length -= index;
	}

	cutMessage() {
		const idx = this.mainBuf.subarray(0, this.length).indexOf("\n");
		if (idx < 0) {
			return null; //not message complete
		}
		//copy and pop the complete message
		const msg = Buffer.from(this.mainBuf.subarray(0, idx + 1));
		this.popBuf(idx + 1);
		return msg;
	}
}

export default DynBuf;