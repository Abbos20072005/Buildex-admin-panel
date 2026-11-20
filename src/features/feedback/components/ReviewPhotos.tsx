import { Image } from "antd";

/** How many pictures of a review are drawn in a table row; the rest is a "+n". */
const SHOWN = 2;

/** The pictures the customer sent with a review: small squares, a click enlarges them. */
export function ReviewPhotos({ images }: { images: string[] }) {
  if (images.length === 0) return <span className="text-slate-400">—</span>;

  return (
    // a click on a picture must not open the row
    <div className="flex items-center gap-1.5" onClick={(event) => event.stopPropagation()}>
      <Image.PreviewGroup>
        {images.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt=""
            width={48}
            height={48}
            className="rounded-lg object-cover"
            // the pictures after the shown ones stay in the gallery, drawn in no space
            wrapperStyle={index < SHOWN ? undefined : { display: "none" }}
            preview={{ mask: false }}
          />
        ))}
      </Image.PreviewGroup>
      {images.length > SHOWN && (
        <span className="text-xs font-semibold text-slate-500">+{images.length - SHOWN}</span>
      )}
    </div>
  );
}
