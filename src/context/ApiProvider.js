import React from "react";
import { ApiContext } from "./MyContext";
import Api from "../data/api";
import { useNavigate } from 'react-router-dom';
import { getAuth } from "../services/util";

const ApiProvider = (props) => {
    let api = new Api();
    const navigate = useNavigate();

    const publicApiRequest = (req) =>
      new Promise((resolve, reject) => {
        api.submitRequest({
          ...req,
          resolve,
          reject,
          auth: null,
        });
      });

    const emitTaskEvent = (event, data) => {
        api.emitTaskEvent(event, data);
    };

    const LogoutFn = () => {
        navigate('./login');
    };

    const privateApiRequest = (req) =>
      new Promise((resolve, reject0) => {
        const auth = getAuth();
        if (!auth) {
          if (reject0) {
            console.log("user not logged in");
          }
          return;
        }
        const reject = (err) => {
          if (err.code === 403) {
            // logOutOnAuthError();
          }
          if (reject0) {
            reject0(err);
          }
        };
        api.submitRequest({
          ...req,
          resolve,
          reject,
          auth,
        });
      });

    const values = {
        publicApiRequest,
        LogoutFn,
        emitTaskEvent,
        privateApiRequest
    };

    return (
        <ApiContext.Provider value={values}>{props.children}</ApiContext.Provider>
    );
};

export default ApiProvider;
