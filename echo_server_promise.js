import * as net from "net";
import { DynBuf } from "./buffer";

//wrapper for net.Socket
const socketInit = (socket) => {
	const conn = {
		socket: socket, //socket obj
		err: null,  // error event
		ended: false, // EOF
		reader: null  //the CB of the promise of current read
	};

	socket.on("data", data => {
		console.assert(conn.reader);
		// pause event until next read
		conn.socket.pause();
		// fulfill the promise of the current read
		conn.reader.resolve(data);
		conn.reader = null;
	});
	socket.on("end", () => {
		conn.ended = true;
		if (conn.reader) {
			conn.reader.resolve(Buffer.from("")); //EOF == ""
			conn.reader = null;
		}
	});
	socket.on("error", err => {
		conn.err = err;
		if (conn.reader) {
			conn.reader.reject(err);
			conn.reader = null;
		}
	});
	return conn;
};

const socketRead = (conn) => {
	console.assert(!conn.reader);
	return new Promise((resolve, reject) => {
		if (conn.err) {
			reject(conn.err);
			return;
		}
		if (conn.ended) {
			resolve(Buffer.from("")); //EOF
			return;
		}

		conn.reader = { resolve: resolve, reject: reject };
		conn.socket.resume();
	});
};

const socketWrite = (conn, data) => {
	console.assert(data.length > 0);
	return new Promise((resolve, reject) => {
		if (conn.err) {
			reject(conn.err);
			return;
		}
		conn.socket.write(data, err => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
};

const serveClient = async (socket) => {
	const conn = socketInit(socket);
	const buf = new DynBuf(0)
	while (true) {
		const data = await socketRead(conn);
		if (data.length == 0) {
			console.log("end connection");
			break;
		}
		console.log("data", data);
		//rewrite the data got on the socket
		await socketWrite(conn, data);
	}
}

const newConn = async (socket) => {
	console.log("new connection", socket.remoteAddress, socket.remotePort);
	try {
		await serveClient(socket);
	} catch (exc) {
		console.error("exception: ", exc);
	} finally {
		socket.destroy();
	}
};

const socketListen = (host, port) => {
	const server = net.createServer();
	server.on("connection", newConn);
	server.listen({ host, port });
};

socketListen("127.0.0.1", 5100)