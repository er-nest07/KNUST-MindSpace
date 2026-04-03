import { createBrowserRouter } from "react-router";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Feed from "./pages/Feed";
import PostDetail from "./pages/PostDetail";
import MyConversations from "./pages/MyConversations";
import BrowseCounsellors from "./pages/BrowseCounsellors";
import ChatPage from "./pages/ChatPage";
import MyProgrammes from "./pages/MyProgrammes";
import CheckIn from "./pages/CheckIn";
import CounsellorDashboard from "./pages/CounsellorDashboard";
import CounsellorCaseDetail from "./pages/CounsellorCaseDetail";
import Profile from "./pages/Profile";
import CommunityGuidelines from "./pages/CommunityGuidelines";
import Crisis from "./pages/Crisis";
import Root from "./pages/Root";
import NotFound from "./pages/NotFound";
import AuthOnly from "./pages/AuthOnly";
import CounsellorOnly from "./pages/CounsellorOnly";
import AdminOnly from "./pages/AdminOnly";
import AdminDashboard from "./pages/AdminDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Landing },
      { path: "register", Component: Register },
      { path: "login", Component: Login },
      { path: "guidelines", Component: CommunityGuidelines },
      { path: "crisis", Component: Crisis },
      {
        Component: AuthOnly,
        children: [
          { path: "feed", Component: Feed },
          { path: "post/:id", Component: PostDetail },
          { path: "conversations", Component: MyConversations },
          { path: "counsellors", Component: BrowseCounsellors },
          { path: "chat/:id", Component: ChatPage },
          { path: "programmes", Component: MyProgrammes },
          { path: "checkin/:id", Component: CheckIn },
          { path: "profile", Component: Profile },
        ],
      },
      {
        Component: CounsellorOnly,
        children: [
          { path: "counsellor/dashboard", Component: CounsellorDashboard },
          { path: "counsellor/case/:id", Component: CounsellorCaseDetail },
        ],
      },
      {
        Component: AdminOnly,
        children: [{ path: "admin/dashboard", Component: AdminDashboard }],
      },
      { path: "*", Component: NotFound },
    ],
  },
]);
