// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

/* -------------------------------
   Public Pages
-------------------------------- */
import About from "./pages/About";        // Updated Home page → About
import Registration from "./pages/Registration";
import Login from "./pages/Login";

/* -------------------------------
   Protected Pages
-------------------------------- */
import Wrapper from "./pages/Wrapper";
import Dashboard from "./pages/dashboard";
import Marketplace from "./pages/Marketplace";
import AnimalDetails from "./pages/AnimalDetails";
import AdoptionForm from "./pages/AdoptionForm";
import AddPet from "./pages/AddPet";
import Notifications from "./pages/Notifications";
import AdoptionList from "./pages/AdoptionList";
import CreateShelter from "./pages/CreateShelter";
import AdminShelterRequests from "./pages/AdminShelterRequests";
import ShelterPage from "./pages/ShelterPage";
import UserPage from "./pages/UserPage";          // new user profile page
import RescueDashboard from "./pages/RescueDashboard"; // rescue dashboard

/* -------------------------------
   Email Approval Pages (Public)
-------------------------------- */
import AdoptionApprove from "./pages/AdoptionApprove";
import AdoptionReject from "./pages/AdoptionReject";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/" element={<About />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login />} />

        {/* Email approval links */}
        <Route path="/adoption-approve/:id" element={<AdoptionApprove />} />
        <Route path="/adoption-reject/:id" element={<AdoptionReject />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/dashboard"
          element={
            <Wrapper>
              <Dashboard />
            </Wrapper>
          }
        />

        <Route
          path="/marketplace"
          element={
            <Wrapper>
              <Marketplace />
            </Wrapper>
          }
        />

        <Route
          path="/animal/:id"
          element={
            <Wrapper>
              <AnimalDetails />
            </Wrapper>
          }
        />

        <Route
          path="/adopt/:id"
          element={
            <Wrapper>
              <AdoptionForm />
            </Wrapper>
          }
        />

        <Route
          path="/add-pet"
          element={
            <Wrapper>
              <AddPet />
            </Wrapper>
          }
        />

        <Route
          path="/notifications"
          element={
            <Wrapper>
              <Notifications />
            </Wrapper>
          }
        />

        <Route
          path="/adoption-list"
          element={
            <Wrapper>
              <AdoptionList />
            </Wrapper>
          }
        />

        {/* Shelter creation */}
        <Route
          path="/create-shelter"
          element={
            <Wrapper>
              <CreateShelter />
            </Wrapper>
          }
        />

        {/* Admin page */}
        <Route
          path="/admin/shelters"
          element={
            <Wrapper>
              <AdminShelterRequests />
            </Wrapper>
          }
        />

        {/* Shelter profile */}
        <Route
          path="/shelter/:id"
          element={
            <Wrapper>
              <ShelterPage />
            </Wrapper>
          }
        />

        {/* User profile */}
        <Route
          path="/user/:id"
          element={
            <Wrapper>
              <UserPage />
            </Wrapper>
          }
        />

        {/* Rescue team dashboard */}
        <Route
          path="/rescue"
          element={
            <Wrapper>
              <RescueDashboard />
            </Wrapper>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
