import * as net from "net";

//create a callback that is call on socket connection
const newConn = (socket) => {
	console.log("new connection on socket", socket.remoteAddress, socket.remotePort);

	socket.on("end", () => {
		//close the connection if received a "FIN" flag
		console.log("EOF.");
	});
	socket.on("data", (data) => {
		console.log("data: ", data);
		socket.write(data);

		if (data.includes("q")) {
			console.log("close socket");
			socket.end(); //send flag FIN and close connection
		}
	});
};

let server = net.createServer();
//add the callback in runtime
server.on("connection", newConn);
//handle socket error
server.on("error", (err) => { throw err; });
server.listen({ host: "127.0.0.1", port: 5100 });