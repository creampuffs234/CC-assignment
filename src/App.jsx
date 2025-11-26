// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

/* ------------------------------------------
   PUBLIC PAGES
------------------------------------------- */
import HomePage from "./pages/HomePage.jsx";
import Registration from "./pages/Registration.jsx";
import Login from "./pages/Login.jsx";

/* ------------------------------------------
   PROTECTED WRAPPER
------------------------------------------- */
import Wrapper from "./pages/Wrapper.jsx";


/* ------------------------------------------
   MAIN PROTECTED PAGES
------------------------------------------- */
import Dashboard from "./pages/Dashboard.jsx";
import Marketplace from "./pages/Marketplace.jsx";
import AnimalDetails from "./pages/AnimalDetails.jsx";
import AdoptionForm from "./pages/AdoptionForm.jsx";
import AddPet from "./pages/AddPet.jsx";
import Notifications from "./pages/Notifications.jsx";
import AdoptionList from "./pages/AdoptionList.jsx";
import CreateShelter from "./pages/CreateShelter.jsx";
import AdminShelterRequests from "./pages/AdminShelterRequests.jsx";
import ShelterPage from "./pages/ShelterPage.jsx";
import UserPage from "./pages/UserPage.jsx";
import RescueDashboard from "./pages/RescueDashboard.jsx";

/* ------------------------------------------
   EMAIL APPROVAL PAGES (PUBLIC)
------------------------------------------- */
import AdoptionApprove from "./pages/AdoptionApprove.jsx";
import AdoptionReject from "./pages/AdoptionReject.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ---------- PUBLIC ROUTES ---------- */}
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login />} />

        {/* ---------- EMAIL APPROVAL PAGES ---------- */}
        <Route path="/adoption-approve/:id" element={<AdoptionApprove />} />
        <Route path="/adoption-reject/:id" element={<AdoptionReject />} />

        {/* ---------- PROTECTED ROUTES (Require Login) ---------- */}
        <Route
          path="/dashboard"
          element={<Wrapper><Dashboard /></Wrapper>}
        />

        <Route
          path="/marketplace"
          element={<Wrapper><Marketplace /></Wrapper>}
        />

        <Route
          path="/animal/:id"
          element={<Wrapper><AnimalDetails /></Wrapper>}
        />

        <Route
          path="/adopt/:id"
          element={<Wrapper><AdoptionForm /></Wrapper>}
        />

        <Route
          path="/add-pet"
          element={<Wrapper><AddPet /></Wrapper>}
        />

        <Route
          path="/notifications"
          element={<Wrapper><Notifications /></Wrapper>}
        />

        <Route
          path="/adoption-list"
          element={<Wrapper><AdoptionList /></Wrapper>}
        />

        <Route
          path="/create-shelter"
          element={<Wrapper><CreateShelter /></Wrapper>}
        />

        <Route
          path="/admin/shelters"
          element={<Wrapper><AdminShelterRequests /></Wrapper>}
        />

        <Route
          path="/shelter/:id"
          element={<Wrapper><ShelterPage /></Wrapper>}
        />

        <Route
          path="/user/:id"
          element={<Wrapper><UserPage /></Wrapper>}
        />

        <Route
          path="/rescue"
          element={<Wrapper><RescueDashboard /></Wrapper>}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
