import axios from "axios";
import { io } from 'socket.io-client';

class Api {
  constructor() {
    this.nextReqId = 0;
    this.submittedCmds = {};
    this.pendingReqs = [];
    this.version = "v1";
    this.isRefreshingToken = false;

    // Singleton for Socket.io client
    if (!Api.socketInstance) {
      Api.socketInstance = io('http://localhost:8080', {
        withCredentials: true,
        transports: ['websocket', 'polling'],
      });

      // Listen for socket events
      Api.socketInstance.on('taskCreated', (newTask) => {
        console.log('Task created:', newTask);
        // Handle new task created (update state, etc.)
      });

      Api.socketInstance.on('taskUpdated', (updatedTask) => {
        console.log('Task updated:', updatedTask);
        // Handle task update (update state, etc.)
      });

      Api.socketInstance.on('taskDeleted', (taskId) => {
        console.log('Task deleted:', taskId);
        // Handle task deletion (update state, etc.)
      });
    }
    
    this.socket = Api.socketInstance;

    // Axios interceptor for handling token refresh
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          if (error.config.url !== `/${this.version}/auth/refresh-tokens`) {
            if (!this.isRefreshingToken) {
              this.isRefreshingToken = true;
              return this.refreshToken(error);
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  retireSubmittedCommand = (id, cmd) => {
    if (this.submittedCmds[cmd] === id) {
      delete this.submittedCmds[cmd];
      if (Object.keys(this.submittedCmds).length === 0) {
        this.nextReqId = 0;
      }
    }
  };

  async refreshToken(error) {
    try {
      const response = await axios.post("/v1/auth/refresh-tokens", null, {
        withCredentials: true,
      });

      const newAccessToken = response.data;
      localStorage.setItem("auth", newAccessToken);
      this.isRefreshingToken = false;

      error.config.headers["x-access-token"] = newAccessToken;
      return await axios(error.config);
    } catch (refreshError) {
      console.log("Refresh error:", refreshError);
      this.isRefreshingToken = false;
      const userId = localStorage.getItem("u_userId");
      await axios.post("/v1/auth/clear_session", { userId });
      localStorage.removeItem("auth");
      localStorage.removeItem("sessionId");
      localStorage.removeItem("u_userId");
      window.location.href = "/login";
      return await Promise.reject(refreshError);
    }
  }

  emitTaskEvent(event, data) {
    this.socket.emit(event, data);
  }

  setSuccessHandler = (req) => {
    const { id, cmd, resolve } = req;
    if (!resolve) {
      return;
    }
    req.onSuccess = (rsp, headers) => {
      resolve({ rsp, headers });
      this.retireSubmittedCommand(id, cmd);
      this.processPendingRequests(req);
    };
  };

  setFailureHandler = (req) => {
    const { id, cmd, reject } = req;
    req.onFailure = (err) => {
      if (reject) {
        reject(err);
      }
      this.retireSubmittedCommand(id, cmd);
      this.processPendingRequests(req, true);
    };
  };

  processPendingRequests(req, isFailure = false) {
    const prevPendingReqs = this.pendingReqs;
    this.pendingReqs = [];
    prevPendingReqs.forEach((pendingReq) => {
      const i = pendingReq.depIds.indexOf(req.id);
      if (isFailure || i === -1) {
        this.pendingReqs.push(pendingReq);
      } else if (pendingReq.depIds.length === 1) {
        this.issueRequest(pendingReq);
      } else {
        pendingReq.depIds.splice(i, 1);
        this.pendingReqs.push(pendingReq);
      }
    });
  }

  parseAxiosResponse = (rsp) => {
    if (rsp.status >= 200 && rsp.status < 300) {
      return rsp.data;
    } else {
      throw new Error(`Fetch error (${rsp.status}): ${rsp.statusText}`);
    }
  };

  checkExpectedRowCount = (n) => (rsp) => {
    if (!n || rsp.length === n) {
      return rsp;
    }
    throw new Error(`Fetch error: expected ${n} rows`);
  };

  setVersion = (version) => {
    this.version = version;
  };

  issueRequest = ({
    auth = null,
    cmd,
    args,
    method = 'POST',
    rowCount = null,
    onSuccess,
    onFailure,
    isFileUpload = false,
  }) => {
    const baseURL = 'http://localhost:8080';
    const url = `${baseURL}/${this.version}/${cmd}`;
    let headers = {
      Accept: "application/json",
    };
    if (!isFileUpload) {
      headers["Content-Type"] = "application/json";
    }
    if (auth) {
      headers["x-access-token"] = auth;
    }
    const config = {
      method: method,
      headers: headers,
      data: isFileUpload ? args : JSON.stringify(args),
      url: url,
      withCredentials: true, // Set to true for CORS cookies
    };

    axios(config)
      .then((rsp) => {
        headers = rsp.headers;
        return this.parseAxiosResponse(rsp);
      })
      .then(this.checkExpectedRowCount(rowCount))
      .then((rsp) => onSuccess(rowCount === 1 ? rsp[0] : rsp, headers))
      .catch((err) => {
        console.log(err.message);
        onFailure(err);
      });
  };

  submitRequest = ({ deps, ...req }) => {
    req.id = this.nextReqId++;
    this.setSuccessHandler(req);
    this.setFailureHandler(req);

    req.depIds = [];
    if (deps) {
      if (typeof deps === "boolean") {
        Object.values(this.submittedCmds).forEach((id) => req.depIds.push(id));
      } else {
        deps.forEach((cmd) => {
          const id = this.submittedCmds[cmd];
          if (id != null) {
            req.depIds.push(id);
          }
        });
      }
    }
    if (req.depIds.length > 0) {
      this.pendingReqs.push(req);
    } else {
      this.issueRequest(req);
    }

    this.submittedCmds[req.cmd] = req.id;
  };
}

export default Api;
