import Header from "../../Header";
import { NostrService } from "../../utils/NostrService";

async function getNote(eventid: string) {
  const relay = await NostrService.connect("wss://nostr-pub.wellorder.net");
  const event = await NostrService.getEvent(eventid, relay);
  console.log(event);

  return event;
}

export default async function NotePage({ params }: any) {
  // console.log("HELLO")
  // console.log(params)
  const note = await getNote(params.eventid);

  return (
    <div>
      <Header />
      <h1 className="text-slate-50 text-2xl">note id: {note?.id}</h1>
      <div className="">
        <p className="text-slate-300">pubkey: {note?.pubkey}</p>
        <p className="text-slate-300">content: {note?.content}</p>
        <p className="text-slate-300">kind: {note?.kind}</p>
        <ul className="text-slate-300">tags:
          {note?.tags.map(([title, content]: string[]) => (
            <li key={title} className="pl-4">{`${title}: ${content}`}</li>
          ))}
        </ul>
        <p className="text-slate-300">sig: {note?.sig}</p>
        <p className="text-slate-300">created_at: {note?.created_at}</p>
      </div>
    </div>
  );
}
