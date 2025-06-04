import SideBar from "./SideBar";

export default function Layout({ children }) {
  return (
    <main className="grid gap-4 p-4 grid-cols-[220px,_1fr]">
      <SideBar />
      {children}
    </main>
  );
}
