/*
use a dynamic Buffer to avoid using Buffer.concat()
Because with Buffer.concat()
	the old data is copied
*/

class DynBuf {
	constructor(size) {
		this.mainBuf = Buffer.alloc(size);
		this.length = this.mainBuf.length;
		this.currIdx = 0; //track the current message to treshold the front pop
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

	popBuf() {
		this.mainBuf.copyWithin(0, this.currIdx, this.length);
		this.length -= this.currIdx;
		this.currIdx = 0;
	}

	cutMessage() {
		const idx = this.mainBuf.subarray(this.currIdx, this.length).indexOf("\n");
		if (idx < 0) {
			return null; //not message complete
		}
		//copy and pop message if remaining data is bigger than 1/3 of buffer
		const msg = Buffer.from(this.mainBuf.subarray(this.currIdx, this.currIdx + idx + 1));  //return new message include "\n"
		this.currIdx += idx + 1;
		if (this.currIdx > this.length / 3) {
			this.popBuf(idx + 1);
		}
		return msg;
	}
}

export default DynBuf;