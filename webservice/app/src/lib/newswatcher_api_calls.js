/*
  All Functions related to API calls to the newswatcher service
*/

export function getNews(api_token, sym, provider_id) {
  let url = process.env.API_ROOT + "/news?api_token="+api_token
  if(sym != "") {
    url = url + "&sym="+sym
  }
  if(provider != "") {
    url = url + "&provider_id="+provider_id
  }
  const promiseNews = fetch(url)
    .then(response => response.text())
    .then(data => JSON.parse(data))
  return promiseNews;
}

export function getProviders(api_token) {
  let url = process.env.API_ROOT + "/news/providers?api_token="+api_token
	const promiseProviders = fetch(url)
		.then(response => response.text())
		.then(data => JSON.parse(data))
	return promiseProviders;
}

export function getEvents(api_token, date) {
  let url = process.env.API_ROOT + "/news/events?api_token="+api_token+"&date="+date
	const promiseEvents = fetch(url)
		.then(response => response.text())
		.then(data => JSON.parse(data))
	return promiseEvents;
}
