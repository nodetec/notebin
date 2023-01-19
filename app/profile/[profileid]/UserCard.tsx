export default function UserCard({ name, npub, about, picture }: any) {
  return (
    <div className="p-4 flex flex-col items-start gap-4">
      <img className="rounded-full w-32" src={picture} alt={name} />
      <p className="text-2xl font-bold text-zinc-200">
        <span className="text-red-500">@</span>
        {name}
      </p>
      <p className="text-lg text-accent">{npub}</p>
      <p className="text-sm text-accent">{about}</p>
    </div>
  );
}
