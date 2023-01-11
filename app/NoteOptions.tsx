"use client";

export default function NoteOptions() {
  return (
    <div className="text-xl dark:text-slate-300 p-3 rounded-md flex flex-col justify-between">
      Options
      <div className="flex flex-col gap-4 mb-4 py-5">
        <div className="flex flex-col gap-2 justify-start items-start text-sm mb-4">
          <label>Filename</label>
          <input
            type="text"
            placeholder="Enter filename..."
            className="px-3 py-2 rounded w-full text-slate-300 bg-gray-600"
          />
        </div>
        {/* <div className="flex flex-col gap-2 justify-start items-start text-sm mb-4"> */}
        {/*   <label>Kind</label> */}
        {/*   <select className="px-3 py-2 rounded-md text-sm w-full text-slate-300 bg-gray-600 outline-none"> */}
        {/*     <option>1</option> */}
        {/*     <option>2</option> */}
        {/*     <option>3</option> */}
        {/*   </select> */}
        {/* </div> */}
        <div className="flex flex-col gap-2 justify-start items-start text-sm mb-4">
          <label>Syntax</label>
          <select className="px-3 py-2 rounded-md text-sm w-full text-slate-300 bg-gray-600 outline-none">
            <option>JavaScript</option>
            <option>C++</option>
            <option>Python</option>
          </select>
        </div>
        <div className="flex flex-col gap-2 justify-start items-start text-sm mb-4">
          <label>Tags</label>
          <input
            type="text"
            placeholder="Enter Tags..."
            className="px-3 py-2 rounded w-full text-slate-300 bg-gray-600"
          />
        </div>
        <div className="flex flex-col gap-2 justify-start items-start text-sm mb-4">
          <label>Relay</label>
          <select className="px-3 py-2 rounded-md text-sm w-full text-slate-300 bg-gray-600 outline-none">
            <option>https://nostr.chiarulli.me</option>
            <option>https://nostr.mycoolrelay.com</option>
            <option>https://nostr.bestrelay.net</option>
          </select>
        </div>
        <div className="flex flex-row gap-2 justify-start items-center mb-4">
          <input
            type="checkbox"
            className="focus:ring-offset-0 focus:ring-0 rounded text-pink-500 bg-gray-200 focus:outline-none"
            id="flexCheckChecked"
          />
          {/* TODO: fix this hack, having troubling aligning center */}
          <label className="text-sm pb-1" htmlFor="flexCheckChecked">
            encrypt
          </label>
        </div>
        <span className="text-sm">▶ Advanced</span>
      </div>
      <button className="font-bold flex flex-row justify-center items-center bg-blue-400 hover:bg-blue-500 text-sm dark:text-slate-900 py-1 px-2 rounded-md w-2/5 self-center">
        Send
      </button>
    </div>
  );
}
