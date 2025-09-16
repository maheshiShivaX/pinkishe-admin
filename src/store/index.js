import { configureStore } from '@reduxjs/toolkit';
import authReducer from "./authSlice";
import dispenseReducer from './dispenseSlice';
import organisationReducer from './organisationSlice';
import vendingMasterReducer from './vendingMasterSlice'
import schoolReducer from './schoolSlice'
import allocationMasterReducer from './allocationMasterSlice'
import registerReducer from './registerSlice';
import vendingMachineReducer from './getVendingMachineSlice';
import userReducer from './userSlice';
import dashboardReducer from './dashboardSlice';
import geolocationReducer from './geolocationSlice';
import notificationSlice from './notificationSlice';
import ngoSpoc from './ngoSpocSlice'
const store = configureStore({
  reducer: {
    auth: authReducer,
    dispense: dispenseReducer,
    organisation: organisationReducer,
    vendingMaster: vendingMasterReducer,
    school: schoolReducer,
    allocationMaster: allocationMasterReducer,
    userEdit: registerReducer,  
    getVendingMachine: vendingMachineReducer,
    user: userReducer,
    dashboard: dashboardReducer,
    geolocation: geolocationReducer,
    notification: notificationSlice,
    ngoSpoc: ngoSpoc
  },
});

export default store;
