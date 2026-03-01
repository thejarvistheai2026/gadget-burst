import { Provider } from "@gadgetinc/react";
import { Suspense, useEffect } from "react";
import { BrowserRouter, Outlet, Route, Routes, useNavigate } from "react-router";
import { api } from "../api";
import "../app.css";
import ForgotPasswordPage from "../routes/forgot-password";
import IndexPage from "../routes/index";
import NotFoundPage from "../routes/not-found";
import ProfilePage from "../routes/profile";
import ResetPasswordPage from "../routes/reset-password";
import SignInPage from "../routes/sign-in";
import SignUpPage from "../routes/sign-up";
import SignedInPage from "../routes/signed-in";
import VerifyEmailPage from "../routes/verify-email";
import BurstNewPage from "../routes/bursts/new";
import BurstDetailPage from "../routes/bursts/$id";
import BurstEditPage from "../routes/bursts/$id.edit";
import SettingsPage from "../routes/settings";
import ContactsPage from "../routes/contacts";
import ChurnTrackerPage from "../routes/churn-tracker";
import ChurnTemplatesPage from "../routes/churn-templates";
import PublicLayout from "./layouts/public";
import AuthLayout from "./layouts/auth";
import AppLayout from "./layouts/app";
import { Toaster } from "./ui/sonner";

const App = () => {
  useEffect(() => {
    document.title = `${window.gadgetConfig.env.GADGET_APP}`;
  }, []);

  return (
    <Suspense fallback={<></>}>
      <Toaster richColors />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route element={<PublicLayout />}>
              <Route index element={<IndexPage />} />
            </Route>
            <Route element={<AuthLayout />}>
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="sign-in" element={<SignInPage />} />
              <Route path="sign-up" element={<SignUpPage />} />
              <Route path="reset-password" element={<ResetPasswordPage />} />
              <Route path="verify-email" element={<VerifyEmailPage />} />
            </Route>
            <Route element={<AppLayout />}>
              <Route path="signed-in" element={<SignedInPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="bursts/new" element={<BurstNewPage />} />
              <Route path="bursts/:id" element={<BurstDetailPage />} />
              <Route path="bursts/:id/edit" element={<BurstEditPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="contacts" element={<ContactsPage />} />
              <Route path="churn-tracker" element={<ChurnTrackerPage />} />
              <Route path="churn-templates" element={<ChurnTemplatesPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </Suspense>
  );
};

const Layout = () => {
  const navigate = useNavigate();

  return (
    <Provider api={api} navigate={navigate} auth={window.gadgetConfig.authentication}>
      <Outlet />
    </Provider>
  );
};

export default App;