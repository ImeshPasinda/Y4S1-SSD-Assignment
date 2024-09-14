import React from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux'; // To get authentication state
import { Helmet } from 'react-helmet'; // Helmet for security headers

import Footer from './components/Footer';
import Header from './components/Header';
import SnackBarMsg from './components/SnackBarMsg';

// Direct import of screens without lazy loading
import CartScreen from './screens/CartScreen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import OrderListScreen from './screens/OrderListScreen';
import OrderScreen from './screens/OrderScreen';
import PaymentScreen from './screens/PaymentScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import ProductListScreen from './screens/ProductListScreen';
import ProductScreen from './screens/ProductScreen';
import ProfileScreen from './screens/ProfileScreen';
import RegisterScreen from './screens/RegisterScreen';
import ShippingScreen from './screens/ShippingScreen';
import UserListScreen from './screens/UserListScreen';

// Protected route for authenticated users
const PrivateRoute = ({ component: Component, ...rest }) => {
  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  return (
    <Route
      {...rest}
      render={props =>
        userInfo ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

// Protected route for admin users only
const AdminRoute = ({ component: Component, ...rest }) => {
  const userLogin = useSelector(state => state.userLogin);
  const { userInfo } = userLogin;

  return (
    <Route
      {...rest}
      render={props =>
        userInfo && userInfo.isAdmin ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

const App = () => {
  return (
    <Router>
      {/* Helmet for setting security headers */}
      <Helmet>
        <meta charSet="utf-8" />
      
        {/* Prevent MIME type sniffing */}
        <meta name="X-Content-Type-Options" content="nosniff" />
        {/* Protect from Clickjacking attacks */}
        <meta name="X-Frame-Options" content="DENY" />
        {/* XSS protection in browsers */}
        <meta name="X-XSS-Protection" content="1; mode=block" />
        <title>Secure E-Commerce App</title>
      </Helmet>

      <Header />
      <main style={{ paddingRight: '5%', paddingLeft: '5%' }}>
        {/* Routes with protected access */}
        {/* Private routes for authenticated users */}
        <PrivateRoute path="/profile" component={ProfileScreen} />
        <PrivateRoute path="/shipping" component={ShippingScreen} />
        <PrivateRoute path="/payment" component={PaymentScreen} />
        <PrivateRoute path="/placeorder" component={PlaceOrderScreen} />

        {/* Open routes */}
        <Route path="/register" component={RegisterScreen} />
        <Route path="/login" component={LoginScreen} />
        <Route path="/cart/:id?" component={CartScreen} />
        <Route path="/order/:id" component={OrderScreen} />
        <Route path="/product/:id" component={ProductScreen} />
        <Route path="/search/:keyword" component={HomeScreen} exact />
        <Route path="/page/:pageNumber" component={HomeScreen} exact />
        <Route path="/search/:keyword/page/:pageNumber" component={HomeScreen} exact />
        <Route path="/" component={HomeScreen} exact />

        {/* Admin-only routes */}
        <AdminRoute path="/admin/productlist" component={ProductListScreen} exact />
        <AdminRoute path="/admin/productlist/:pageNumber" component={ProductListScreen} exact />
        <AdminRoute path="/admin/userlist" component={UserListScreen} />
        <AdminRoute path="/admin/orderlist" component={OrderListScreen} />

        <SnackBarMsg />
      </main>
      <Footer />
    </Router>
  );
};

export default App;
