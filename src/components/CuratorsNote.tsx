interface CuratorsNoteProps {
  text: string;
  attribution?: string;
  label?: string;
}

export default function CuratorsNote({ text, attribution, label = "Curator's Note" }: CuratorsNoteProps) {
  return (
    <div className="curators-note">
      <p className="curators-note-label">{label}</p>
      <p className="curators-note-text">{text}</p>
      {attribution && (
        <p className="curators-note-attribution">— {attribution}</p>
      )}
    </div>
  );
}
