import * as types from "./types";
import * as UserService from "../services/api/user";
import { setAuth, getAuth } from "../utils/utils";

export const getData = () => {
  return async dispatch => {
    dispatch(startGetUserData());
    const response = await UserService.getUserData();
    if (response) dispatch(getUserData(response));
  };
};

const getUserData = response => {
  return { type: types.GET_USER_DATA, payload: { data: response.data } };
};

const startGetUserData = () => {
  return { type: types.START_GET_USER_DATA };
};

const finishGetUserData = () => {
  return { type: types.FINISH_GET_USER_DATA };
};

export const updateAidiUserData = async (dispatch, username) => {
  dispatch(startGetUserData());
  const user = await getAuth();
  const response = await UserService.updateUserData(user.username);
  if (response && response.data) {
    await setAuth({ ...user, ...response.data });
  }
  dispatch(finishGetUserData());
};
