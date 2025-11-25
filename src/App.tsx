import { Route, Routes } from "react-router-dom";
import "./App.css";
import BaseForm from "./BaseForm";

function App() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <BaseForm
              initialValues={{
                title: "",
                content: "",
                file: [],
                status: "진행전",
                host: "",
                startDate: "",
                category: "일반업무",
                department: [],
                member: [],
              }}
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;
