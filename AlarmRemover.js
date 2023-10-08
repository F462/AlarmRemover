// Abort if amout of arguments is too low
if (process.argv.length <= 2) {
	console.warn("iCal file as argument is missing!");
	console.info(`Usage: ${process.argv.join(" ")} <iCal file>`);
	return 1;
}

const fs = require("fs");

const iCalFile = process.argv[2];

if (!fs.existsSync(iCalFile)) {
	console.error(`Given file ${iCalFile} not found!`);
	return 2;
}

fs.readFile(iCalFile, "utf8", (err, data) => {
	if (err) {
		console.error(err);
		return 3;
	}

	let deleteLine = false;
	const lines = data
		.split(/\r?\n|\r|\n/g)
		.map((line) => {
			if (deleteLine) {
				if (line.includes("END:VALARM")) {
					deleteLine = false;
				}
			} else {
				if (line.includes("BEGIN:VALARM")) {
					deleteLine = true;
					return undefined;
				}

				return line;
			}
		})
		.filter((line) => line !== undefined);

	const stream = fs.createWriteStream(iCalFile);
	stream.once("open", function () {
		for (const line of lines) {
			stream.write(line);
			stream.write("\n");
		}

		stream.end();
	});

	console.info("Alarms successfully removed from file.");
});
