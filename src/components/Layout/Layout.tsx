import { FC, ReactNode } from "react";
import Header from "./Header";
import SideBar from "./SideBar";

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex">
      <SideBar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 bg-background/50">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
