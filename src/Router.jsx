// AppRouter.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import PrivateRoute from "./components/PrivateRoute"; // Import the PrivateRoute component
import NotFound from "./components/NotFound"; // Import the NotFound component

import {
  Dashboard,
  Team,
  Invoices,
  Contacts,
  Line,
  Pie,
  FAQ,
  Geography,
} from "./scenes";
import Login from "./scenes/login";
import OrganisationForm from "./scenes/organisationForm";
import VendingForm from "./scenes/vendingForm";
import AllocationForm from "./scenes/allocationForm";
import SchoolForm from "./scenes/schoolForm";
import SchoolList from "./scenes/schoolList";
import RegisterForm from "./scenes/register";
import GeoLocationForm from "./scenes/geoLocationForm";
import GeoLocationList from "./scenes/geoLocationList";
import UserForm from "./scenes/userForm";
import DispenseHistory from "./scenes/dispenseHistory";
import NgoSpocForm from "./scenes/ngoSpocForm";
import RefillingHistory from "./scenes/refillingHistory";
import NgoSpocList from "./scenes/ngoSpocList";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* <Route path="/register" element={<RegisterForm />} /> */}
        <Route path="/" element={<App />}>
          {/* Wrap protected routes inside PrivateRoute */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/team"
            element={
              <PrivateRoute>
                <Team />
              </PrivateRoute>
            }
          />

          <Route
            path="/userForm"
            element={
              <PrivateRoute>
                <UserForm />
              </PrivateRoute>
            }
          />

          <Route
            path="/users/edit/:username"
            element={
              <PrivateRoute>
                <UserForm />
              </PrivateRoute>
            }
          />

          <Route
            path="/dispenseHistory"
            element={
              <PrivateRoute>
                <Contacts />
              </PrivateRoute>
            }
          />

          <Route
            path="/spocs"
            element={
              <PrivateRoute>
                <NgoSpocList />
              </PrivateRoute>
            }
          />

          <Route
            path="/refillingHistory"
            element={
              <PrivateRoute>
                <RefillingHistory />
              </PrivateRoute>
            }
          />

          <Route
            path="/machineStatus"
            element={
              <PrivateRoute>
                <Invoices />
              </PrivateRoute>
            }
          />

          <Route
            path="/geoLocations"
            element={
              <PrivateRoute>
                <GeoLocationList />
              </PrivateRoute>
            }
          />

          <Route
            path="/schools"
            element={
              <PrivateRoute>
                <SchoolList />
              </PrivateRoute>
            }
          />

          <Route
            path="/geoForm"
            element={
              <PrivateRoute>
                <GeoLocationForm />
              </PrivateRoute>
            }
          />

          <Route
            path="/organisationForm"
            element={
              <PrivateRoute>
                <OrganisationForm />
              </PrivateRoute>
            }
          />

          <Route
            path="/registerSchool"
            element={
              <PrivateRoute>
                <SchoolForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/vendingMaster"
            element={
              <PrivateRoute>
                <VendingForm />
              </PrivateRoute>
            }
          />

          <Route
            path="/edit-vending-machine/:id"
            element={
              <PrivateRoute>
                <VendingForm />
              </PrivateRoute>
            }
          />

          <Route
            path="ngo"
            element={
              <PrivateRoute>
                <NgoSpocForm />
              </PrivateRoute>
            }
          />

          <Route
            path="/edit-spoc/:id"
            element={
              <PrivateRoute>
                <NgoSpocForm />
              </PrivateRoute>
            }
          />

          <Route
            path="/edit-geolocation/:id"
            element={
              <PrivateRoute>
                <GeoLocationForm />
              </PrivateRoute>
            }
          />

          <Route
            path="/dispenseHistoryMachine/:id"
            element={
              <PrivateRoute>
                <DispenseHistory />
              </PrivateRoute>
            }
          />

          <Route
            path="/edit-school/:id"
            element={
              <PrivateRoute>
                <SchoolForm />
              </PrivateRoute>
            }
          />

          <Route
            path="/allocateMachine"
            element={
              <PrivateRoute>
                <AllocationForm />
              </PrivateRoute>
            }
          />
        </Route>
        {/* Catch-all route for undefined paths */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
