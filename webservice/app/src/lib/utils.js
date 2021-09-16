import moment from 'moment'

export function checkDate(dateStr) {
	let momentDate = moment(dateStr);
	let currentDate = moment();

	let minDiff = moment.duration(currentDate.diff(momentDate, 'minutes'), "minutes");
	if(minDiff.minutes() < 120) {
		return minDiff.humanize();
	}
	else {
		let hourDiff = moment.duration(currentDate.diff(momentDate, 'hours'), "hours");
		if(hourDiff.hours() < 48) {
			return hourDiff.humanize();
		}
		else {
			let dayDiff = moment.duration(currentDate.diff(momentDate, 'day'), "day");
			if(dayDiff.days() < 14) {
				return dayDiff.humanize();
			}
			else {
				let weekDiff = moment.duration(currentDate.diff(momentDate, 'week'), "week");
				return weekDiff.humanize();
			}
		}
	}
}


export function parseGetQuery(queryString) {
	const qs = require('query-string');
	var parsed = qs.parse(queryString);
	return parsed;
}

export function findElement(arr, propName, propValue) {
  for (var i=0; i < arr.length; i++)
    if (arr[i][propName] == propValue)
      return arr[i];

  // will return undefined if not found; you could return a default instead
}
