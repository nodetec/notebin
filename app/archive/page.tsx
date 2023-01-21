import ArchiveNotes from "./ArchiveNotes";

export default function ArchivePage() {
  return (
    <div className="flex flex-col justify-center gap-3">
      <h1 className="text-3xl">Note Archive</h1>
      <ArchiveNotes />
    </div>
  );
}
