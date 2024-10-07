import './App.css';
import Login from './pages/Login/Login';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ApiProvider from "./context/ApiProvider";
import Home from './pages/Home/Home';
import DataProvider from './context/DataProvider';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <ApiProvider>
          <DataProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/login" element={<Login />}></Route>
              <Route path="/home" element={<Home />}></Route>
            </Routes>
          </DataProvider>
        </ApiProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
