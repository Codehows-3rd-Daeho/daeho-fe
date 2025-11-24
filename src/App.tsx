import { Route, Routes } from "react-router-dom";
import "./App.css";
import BaseForm from "./BaseForm";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<BaseForm />} />
      </Routes>
    </>
  );
}

export default App;
