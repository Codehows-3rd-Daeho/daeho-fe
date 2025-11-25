import { Route, Routes } from "react-router-dom";
import "./App.css";
import IssueRegister from "./issue/pages/IssueRegister";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<IssueRegister />} />
      </Routes>
    </>
  );
}

export default App;
