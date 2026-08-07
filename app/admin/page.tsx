import Link from "next/link";
import AdminGate from "@/components/admin/AdminGate";

const TOOLS = [
  {
    href: "/admin/albums/new",
    title: "Nuevo álbum",
    description: "Ficha de un álbum, a partir de su Spotify Album ID.",
  },
  {
    href: "/admin/albums/editorial",
    title: "Editorial de álbum",
    description:
      "Cargar la editorial de un álbum existente a partir de su Album ID.",
  },
  {
    href: "/admin/albums/tags",
    title: "Tags de álbum",
    description:
      "Cargar styles, moods y contexts de un álbum existente a partir de su Album ID.",
  },
  {
    href: "/admin/albums/personnel",
    title: "Personnel de álbum",
    description:
      "Cargar el personnel de un álbum existente a partir de su Album ID.",
  },
  {
    href: "/admin/tracks/new",
    title: "Nuevo track",
    description:
      "Cargar tracks en cualquier álbum existente a partir de su Album ID.",
  },
  {
    href: "/admin/artists/new",
    title: "Nuevo artista",
    description: "Crear un artista a partir de su Spotify Artist ID.",
  },
  {
    href: "/admin/artists/editorial",
    title: "Editorial de artista",
    description:
      "Cargar la editorial de un artista existente a partir de su Artist ID.",
  },
  {
    href: "/admin/tracks/editorial",
    title: "Editorial de track",
    description:
      "Cargar la editorial de un track existente a partir de su Track ID.",
  },
  {
    href: "/admin/tracks/tags",
    title: "Tags de track",
    description:
      "Cargar moods, contexts, rhythms e instrumentos de un track existente a partir de su Track ID.",
  },
  {
    href: "/admin/artists/tags",
    title: "Tags de artista",
    description:
      "Cargar instrumento principal, styles y contexts de un artista existente a partir de su Artist ID.",
  },
];

export default function AdminHomePage() {
  return (
    <AdminGate showBackLink={false}>
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-2xl font-extrabold tracking-[-.02em]">
          Panel de admin
        </h1>
        <p className="mt-1 mb-8 text-sm text-[rgba(233,230,223,.6)]">
          Herramientas internas de carga de contenido.
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="rounded-xl border border-[rgba(233,230,223,.15)] bg-[rgba(233,230,223,.02)] p-5 transition-colors hover:border-[#d99b10] hover:bg-[rgba(233,230,223,.04)]"
            >
              <div className="font-bold text-[#e9e6df]">{tool.title}</div>
              <p className="mt-1.5 text-sm text-[rgba(233,230,223,.6)]">
                {tool.description}
              </p>
              <span className="mt-3 inline-block text-sm font-bold text-[#d99b10]">
                Abrir →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </AdminGate>
  );
}
