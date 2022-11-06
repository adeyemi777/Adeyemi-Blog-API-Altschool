const ObjectId = require("mongoose").Types.ObjectId;

const calculateReadingTimeInString = (title, body) => {
	// calculate Blog field: reading_time
	const averageReadingRate = 238;
	const wordsCount = [...title.split(" "), ...body.split(" ")].length; // split the title and body into items in an array and add them to the wordsCount array as items
	const totalMinutes = String(wordsCount / averageReadingRate);
	const minutesAndSeconds = totalMinutes.split(".");
	const minutes = String(minutesAndSeconds[0]);
	const seconds = String(`0.${minutesAndSeconds[1]}` * 60); // the decimal place is seconds
	if (minutes > 0 && seconds > 0) {
		return `~ ${minutes} minute(s) ${Math.floor(seconds)} second(s)`;
	} else if (seconds > 0) {
		// if it is decimal
		return `~ ${Math.floor(seconds)} second(s)`;
	} else {
		return `~ ${totalMinutes} minute(s)`;
	}
};

const calculateReadingTimeInNumber = (title, body) => {
	// calculate Blog field: reading_time
	const averageReadingRate = 238;
	const wordsCount = [...title.split(" "), ...body.split(" ")].length; // split the title and body into items in an array and add them to the wordsCount array as items
	const totalMinutes = wordsCount / averageReadingRate;
	return totalMinutes;
};

function isValidObjectId(id) {
	// mongoose has this function but the function returns true for any string with length of 12
	// this function fixes that issue
	if (ObjectId.isValid(id)) {
		if (String(new ObjectId(id)) === id)
			// cast the new Object Id into string and compare it with the id, it should be the same if it's a valid id
			return true;
		return false;
	}
	return false;
}

module.exports = {
	calculateReadingTimeInString,
	calculateReadingTimeInNumber,
	isValidObjectId,
};
