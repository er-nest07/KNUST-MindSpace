import { createBrowserRouter } from "react-router";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Feed from "./pages/Feed";
import PostDetail from "./pages/PostDetail";
import MyConversations from "./pages/MyConversations";
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

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Landing },
      { path: "register", Component: Register },
      { path: "login", Component: Login },
      { path: "feed", Component: Feed },
      { path: "post/:id", Component: PostDetail },
      { path: "conversations", Component: MyConversations },
      { path: "chat/:id", Component: ChatPage },
      { path: "programmes", Component: MyProgrammes },
      { path: "checkin/:id", Component: CheckIn },
      { path: "counsellor/dashboard", Component: CounsellorDashboard },
      { path: "counsellor/case/:id", Component: CounsellorCaseDetail },
      { path: "profile", Component: Profile },
      { path: "guidelines", Component: CommunityGuidelines },
      { path: "crisis", Component: Crisis },
      { path: "*", Component: NotFound },
    ],
  },
]);
