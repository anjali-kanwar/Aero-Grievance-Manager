import {Route, Routes} from "react-router";
import LoginPage from "./pages/LoginPage.jsx";
import HomePage from "./pages/HomePage.jsx";

const App = () => {
  return (
    <div data-theme="nord">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        {/* <Route path="/retrieve" element={<DataRetrievePage />} />
        <Route path="/visualize" element={<DataVisualizePage />} /> */}
      </Routes>
    </div>
  );
};

export default App;