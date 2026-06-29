import { Route, Routes } from "react-router";
import LoginPage from "./pages/LoginPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import DataRetrievePage from "./pages/DataRetrievePage.jsx";
import DataVisualizePage from "./pages/DataVisualizePage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import InternalRoute from "./components/InternalRoute.jsx";

const App = () => {
  return (
    <div data-theme="nord">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/retrieve"
          element={
            <InternalRoute>
              <DataRetrievePage />
            </InternalRoute>
          }
        />
        <Route
          path="/visualize"
          element={
            <InternalRoute>
              <DataVisualizePage />
            </InternalRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;