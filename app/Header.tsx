import Link from "next/link";
import { TbNote } from "react-icons/tb";
import ConnectedRelaysStatus from "./ConnectedRelaysStatus";
import Login from "./Login";

export default function Header() {
  return (
    <div>
      <nav className="flex justify-between flex-row items-stretch pb-12 gap-4">
        <div className="flex items-center justify-between w-full gap-4 flex-col sm:flex-row">
          <div className="flex items-center gap-4">
            <Link
              className="text-3xl font-bold dark:text-zinc-200 text-secondary"
              href="/"
            >
              <div className="flex flex-row">
                <TbNote
                  className="text-secondary dark:text-zinc-200"
                  size="40"
                />
                <span className="dark:text-zinc-200 text-secondary ml-1">
                  note
                </span>
                <span className="text-blue-400">bin</span>
              </div>
            </Link>
          </div>
          <div className="flex gap-4">
            <ConnectedRelaysStatus />
            <Login />
          </div>
        </div>
      </nav>
    </div>
  );
}
