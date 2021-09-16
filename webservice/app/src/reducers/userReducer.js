import {
  SAVE_ACCESS_TOKEN,
  FETCH_USER_DOC_BEGIN, FETCH_USER_DOC_SUCCESS, FETCH_USER_DOC_FAILURE,
  UPDATE_USER_DOC_BEGIN, UPDATE_USER_DOC_SUCCESS, UPDATE_USER_DOC_FAILURE} from 'actions/actionTypes';

const initialState = {
  userDoc: null,
  loading: false,
  error: null
};

export default function userReducer(state = initialState, action) {
  console.log(action)
  switch(action.type) {
    case SAVE_ACCESS_TOKEN:
      return {
        ...state,
        accessToken: action.payload.access_token
      }

    case FETCH_USER_DOC_BEGIN:
      // Mark the state as "loading" so we can show a spinner or something
      // Also, reset any errors. We're starting fresh.
      return {
        ...state,
        loading: true,
        error: null
      };

    case FETCH_USER_DOC_SUCCESS:
      // All done: set loading "false" and set the payloads.
      return {
        ...state,
        loading: false,
        userDoc: action.payload.userDoc
      };

    case FETCH_USER_DOC_FAILURE:
      // The request failed. It's done. So set loading to "false".
      // Save the error, so we can display it somewhere.
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        userDoc: null
      };

    case UPDATE_USER_DOC_BEGIN:
      return {
        ...state,
        loading: true,
        userDoc: null,
        error: null
      };
    case UPDATE_USER_DOC_SUCCESS:
      return {
        ...state,
        loading: false,
        userDoc: action.payload.userDoc
      }
    case UPDATE_USER_DOC_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      }

    default:
      // ALWAYS have a default case in a reducer
      return state;
  }
}
