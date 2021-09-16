import {
  SAVE_ACCESS_TOKEN,
  FETCH_USER_DOC_BEGIN, FETCH_USER_DOC_SUCCESS, FETCH_USER_DOC_FAILURE,
  UPDATE_USER_DOC_BEGIN, UPDATE_USER_DOC_SUCCESS, UPDATE_USER_DOC_FAILURE} from 'actions/actionTypes'

const saveToken = access_token => ({
  type: SAVE_ACCESS_TOKEN,
  payload: { access_token }
});

export function saveAccessToken(access_token) {
  return dispatch => {
    dispatch(saveToken(access_token));
  }
}

const fetchUserDocBegin = () => ({
  type: FETCH_USER_DOC_BEGIN
});

const fetchUserDocSuccess = userDoc => ({
  type: FETCH_USER_DOC_SUCCESS,
  payload: { userDoc }
});

const fetchUserDocFailure = error => ({
  type: FETCH_USER_DOC_FAILURE,
  payload: { error }
});

export function getUserDoc() {
  return dispatch => {
    dispatch(fetchUserDocBegin());
    let status_url = process.env.CP_API + "/sso/validate"
  	return fetch(status_url)
  		.then(res => res.json())
      .then(json => {
        if(json.statusCode == 401) {
          // The user is not currently logged in
          dispatch(fetchUserDocSuccess(null))
        }
        else {
          // The user is logged in to IB
          let username = json.USER_NAME
          let search_url = process.env.COUCHDB_ROOT + "/users/_find"
          let post = {
          	method: "post",
          	headers: {
            	'Content-Type': 'application/json'
          	},
          	//make sure to serialize your JSON body
          	body: JSON.stringify({
        			"selector":{
        				"username":{"$eq":username}
        			}
        		})
        	}
          // get the users doc
          return fetch(search_url, post)
            .then(response => response.text())
      		  .then(data => JSON.parse(data))
            .then(json => {
              if(json['docs'].length == 0) {
                // The user was not found
                // TODO: This is a new user, create a new doc and return it
                dispatch(fetchUserDocSuccess(null))
              }
              else {
                // The user was found
                dispatch(fetchUserDocSuccess(json['docs'][0]))
              }
            })
            .catch(error => dispatch(fetchUserDocFailure(error)));
        }
      })
      .catch(error => dispatch(fetchUserDocFailure(error)));
  };
}


const updateUserDocBegin = () => ({
  type: UPDATE_USER_DOC_BEGIN
});
const updateUserDocSuccess = userDoc => ({
  type: UPDATE_USER_DOC_SUCCESS,
  payload: { userDoc }
});
const updateUserDocFailure = error => ({
  type: UPDATE_USER_DOC_FAILURE,
  payload: { error }
});

export function updateUserDoc(newDoc) {
  return dispatch => {
    dispatch(updateUserDocBegin());
    return fetch(process.env.COUCHDB_ROOT + "/users/"+newDoc['_id'], {
    	method: "put",
    	headers: {
      	'Content-Type': 'application/json'
    	},
    	//make sure to serialize your JSON body
    	body: JSON.stringify(newDoc)
  	})
     .then(response => {
       if(response.status == 201) {
         dispatch(updateUserDocSuccess(newDoc))
       }
       else {
         dispatch(updateUserDocFailure(JSON.parse(response.text())))
       }
     });
   }
 }
