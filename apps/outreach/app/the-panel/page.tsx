import Image from "next/image";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { DocumentItem } from "@/components/document";

type Document = {
  id: number;
  path: string;
  title: string | null;
  authors: string[] | null;
  date: string;
  type: "file" | "url" | "link";
  uploader: string | null;
};

export const metadata: Metadata = {
  title: "A panelről - Celeritas Projekt",
};

const overviewLines = [
  "A Celeritas modul működése egy SiPM szenzoron alapszik, mely egy szcintillátor anyaggal párosítva a bejövő részecskék hatására elektromos jeleket ad.",
  "A panelen található mikrokontroller a jeleket mintavételezi és csúcsérték szerint bekategorizálja.",
];

const theoryLines = [
  "Az ionizáló részecskék átjutnak a fénymentesen zárt doboz falán és a szcintillátor anyagban elnyelődnek, melynek hatására az a veszteségektől eltekintve az eredeti energiával arányos darabszámú fotont bocsát ki 450 nm környékén.",
  "A SiPM záróirányba van kapcsolva. Az egyszerű modell szerint egy-egy látható foton egy-egy mikrocellát süt ki a SiPM-ben, melynek hatására az darabszám arányosan vezetővé válik, így feszültség jelenik meg a nyitóoldalán. A mikrocellák a beljük épített töltésellenálláson folyó áram hatására kerülnek vissza kezdeti állapotba, a lecsengés exponenciális.",
  "A jelet az erősítő fokozat húszszorozza, majd a jelfogó kitartja a csúcsértéket, hogy az analóg-digitál átalakító mintavételezni tudja. Az így mért feszültség érték gyakorlatilag lineáris függvénye az ionizáló részecske összenergiájának.",
];

const calibrationText =
  "Kalibrációkra a BME Nukleáris technika intézetében került sor, ahol különböző radioaktív pontforrásokkal lett a kísérlet hitelesítve. Az irodalomban ismert kibocsátások segítségével azonosítani lehetett az izotópokra jellemző energia - mV párokat, melyekre lineárisan illeszteni lehetett.";

const communicationText =
  "A kísérlet rendelkezik beállításokkal a mérés kivitelezésére vonatkozóan és I2C vonalon kommunikál a HUNITY (NMHH-1) műhold fedélzeti számítógépével.";

export default async function ThePanelPage() {
  const documentationId = Number(process.env.DOCUMENTATION_ID ?? "");
  const hasDocumentationId = Number.isFinite(documentationId);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;
  const canFetchDocumentation =
    hasDocumentationId && Boolean(supabaseUrl) && Boolean(supabaseKey);

  let documentation: Document | null = null;
  let documentationError: string | null = null;

  if (canFetchDocumentation) {
    const supa = await createClient();
    const { data, error } = await supa
      .from("documents")
      .select("*")
      .eq("id", documentationId)
      .maybeSingle();
    if (error) {
      documentationError = error.message;
    } else {
      documentation = data;
    }
  } else if (!hasDocumentationId) {
    documentationError = "Nincs elérhető dokumentáció.";
  } else {
    documentationError = "A dokumentáció jelenleg nem elérhető.";
  }

  return (
    <section className="flex-1 bg-[#0b0b0b] text-white">
      <div className="mx-auto w-full max-w-4xl px-6 pb-16 pt-12 text-center">
        <h1 className="text-4xl font-semibold sm:text-[48px]">A panelről</h1>
        <div className="mt-6 flex justify-center">
          <Image
            src="/panel/hero.jpg"
            alt="A Celeritas panel a laborasztalon"
            width={1200}
            height={675}
            priority
            className="h-auto w-full max-w-[520px]"
            sizes="(min-width: 768px) 520px, 90vw"
          />
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-sm leading-6 text-white/80">
          {overviewLines.map((line, index) => (
            <span key={index}>
              {line}
              {index < overviewLines.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
      </div>

      <div className="mx-auto w-full max-w-5xl px-6 pb-16">
        <div className="grid items-center gap-10 md:grid-cols-[1fr_1.15fr]">
          <div>
            <h2 className="text-2xl font-semibold">A hardver fő elemei</h2>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-white/80">
              <li>Kapcsolóüzemű táp</li>
              <li>Silicon photomultiplier szenzor</li>
              <li>Erősítő</li>
              <li>Analóg jelcsúcsstartó</li>
              <li>STM32F301K8T6 mikrokontroller és annak ADC-je</li>
            </ul>
          </div>
          <figure className="text-center">
            <Image
              src="/panel/schematic.png"
              alt="A panel áramköri diagramja"
              width={960}
              height={540}
              className="mx-auto h-auto w-full max-w-[520px]"
              sizes="(min-width: 768px) 520px, 90vw"
            />
            <figcaption className="mt-2 text-xs text-white/60">
              A panel áramköri diagramja
            </figcaption>
          </figure>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-6 pb-16">
        <div className="grid gap-10 md:grid-cols-[1fr_1.2fr]">
          <figure className="order-2 text-center md:order-1 flex flex-col items-center justify-center">
            <Image
              src="/panel/theory.jpg"
              alt="Az analóg jel tesztje"
              width={900}
              height={600}
              className="mx-auto h-auto w-full max-w-[420px]"
              sizes="(min-width: 768px) 420px, 90vw"
            />
            <figcaption className="mt-2 text-xs text-white/60">
              Az analóg jel (szcintillátor + SiPM + erősítés) tesztje
            </figcaption>
          </figure>
          <div className="order-1 md:order-2">
            <h2 className="text-2xl font-semibold">A mérés elmélete</h2>
            <p className="mt-4 text-sm leading-6 text-white/80">
              {theoryLines.map((line, index) => (
                <span key={index}>
                  {line}
                  {index < theoryLines.length - 1 ? <br /> : null}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-6 pb-16 text-center">
        <h2 className="text-2xl font-semibold">Kalibráció</h2>
        <p className="mx-auto mt-4 max-w-3xl text-sm leading-6 text-white/80">
          {calibrationText}
        </p>
        <p className="mt-4 text-sm text-white/80">Íme pár példa:</p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div>
            <p className="mb-2 text-sm font-semibold">Cézium-137</p>
            <Image
              src="/panel/cs-137.png"
              alt="Cézium-137 spektrum"
              width={520}
              height={360}
              className="mx-auto h-auto w-full max-w-[370px]"
              sizes="(min-width: 768px) 260px, 70vw"
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">Európium-152</p>
            <Image
              src="/panel/eu-152.png"
              alt="Európium-152 spektrum"
              width={520}
              height={360}
              className="mx-auto h-auto w-full max-w-[370px]"
              sizes="(min-width: 768px) 260px, 70vw"
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">Rádium-226</p>
            <Image
              src="/panel/ra-226.png"
              alt="Rádium-226 spektrum"
              width={520}
              height={360}
              className="mx-auto h-auto w-full max-w-[370px]"
              sizes="(min-width: 768px) 260px, 70vw"
            />
          </div>
        </div>
        <p className="mt-8 text-sm text-white/80">A kalibrációs görbe:</p>
        <div className="mt-4 flex justify-center">
          <Image
            src="/panel/calibration.png"
            alt="A kalibrációs görbe"
            width={900}
            height={520}
            className="h-auto w-full max-w-[520px]"
            sizes="(min-width: 768px) 520px, 90vw"
          />
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-6 pb-16">
        <div className="grid items-center gap-10 md:grid-cols-[1fr_1.1fr]">
          <div>
            <h2 className="text-2xl font-semibold">Kommunikáció</h2>
            <p className="mt-4 text-sm leading-6 text-white/80">
              {communicationText}
            </p>
          </div>
          <figure className="text-center">
            <Image
              src="/panel/comm.png"
              alt="A panelnek megadható parancsok"
              width={900}
              height={520}
              className="mx-auto h-auto w-full max-w-[520px]"
              sizes="(min-width: 768px) 520px, 90vw"
            />
            <figcaption className="mt-2 text-xs text-white/60">
              A panelnek megadható parancsok
            </figcaption>
          </figure>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl px-6 pb-20 text-center">
        <h2 className="text-2xl font-semibold">Részletes dokumentáció</h2>
        <div className="mt-6 flex justify-center">
          {documentation ? (
            <div className="w-full max-w-[320px] text-left">
              <DocumentItem doc={documentation} />
            </div>
          ) : (
            <p className="text-sm text-white/60">
              {documentationError ?? "Nincs elérhető dokumentáció."}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
