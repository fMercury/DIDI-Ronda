import { createStackNavigator } from "react-navigation";
import Register from "./Register";
import Login from "./Login";
import Forgot from "./Forgot";
import Code from "./Forgot/code";
import NewPassword from "./Forgot/NewPassword";
import Phone from "./Phone";
import VerifyEmail from "./VerifyEmail";

export default createStackNavigator(
  {
    Register: {
      screen: Register,
    },
    Login: {
      screen: Login,
    },
    Forgot: {
      screen: Forgot,
    },
    ForgotCode: {
      screen: Code,
    },
    Phone: {
      screen: Phone,
    },
    NewPassword: {
      screen: NewPassword,
    },
    VerifyEmail: {
      screen: VerifyEmail,
    },
  },
  {
    headerMode: "none",
    initialRouteName: "Login",
    defaultNavigationOptions: {
      gesturesEnabled: false,
    },
  }
);
