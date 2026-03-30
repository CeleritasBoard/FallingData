import Image from "next/image";

const teamMembers = [
  {
    name: "Gerendás Roland",
    role: "Projektvezető",
    education:
      "BME Gépészmérnöki Kar,\nBSC Mechatronikai mérnök szakirány\nhallgatója",
    bio: "Változó érdeklődési\nkörrel rendelkezem.\nA kísérletünk gyártásának\nkalandja rengeteg\nkihívást, tapasztalatot és örömöt\njelentett számomra.\nHálás vagyok, hogy működőképes\nűreszközünk létrehozására\nlehetőséget kaptunk.",
    image: "/team/roland.jpg",
  },
  {
    name: "Hadházi András",
    role: "Szoftverfejlesztő",
    education:
      "BME Villamosmérnöki\nés Informatikai Kar,\nBSC Villamosmérnök szak\nhallgatója",
    bio: "Szeretek programozni\nés robotokat építeni.\nEleinte bizonytalanul\nés kételkedve\nfogadtam ezt az ötletet,\nde nagy öröm számomra,\nhogy végül sikerült egy\nműködő eszközt építeni.",
    image: "/team/andras.png",
  },
  {
    name: "Horváth Péter",
    role: "Szoftveres fejlesztés vezetője",
    education: "Prohászka Ottokár\nKatolikus Gimnázium\ndiákja",
    bio: "Alapvetően infós\nbeállítottságú ember vagyok.\nSzeretek programozni,\nrendszerben gondolkodni,\nés új dolgokat kipróbálni.\nEz a projekt számomra\nmindezek kibontakozása\nés a kitartásom próbája.",
    image: "/team/peter.jpg",
  },
];

export default function TheTeamPage() {
  return (
    <section className="flex-1 bg-[#0b0b0b] text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 pb-20 pt-12 text-center">
        <h1 className="text-[40px] leading-[48px] font-semibold sm:text-[48px] sm:leading-[56px]">
          Rólunk
        </h1>

        <div className="mt-6 max-w-3xl space-y-4 text-base leading-relaxed text-white/80 sm:text-lg">
          <p>
            A{" "}
            <a
              href="https://cansatverseny.hu"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-white/60 underline-offset-4 transition-colors hover:text-white"
            >
              CanSat Hungary 2024
            </a>{" "}
            verseny döntőjébe jutott csapatok lehetőséget kaptak a{" "}
            <a
              href="https://gnd.bme.hu/hunity"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-white/60 underline-offset-4 transition-colors hover:text-white"
            >
              HUNITY (NMHH-1)
            </a>{" "}
            műholdra egy-egy 45×30×3 mm befoglaló méretű diákkísérlet
            legyártására. A Kollégium Space Agency és a Parsec döntős
            középiskolás csapat utódjaként létrejött Celeritas projekt egy
            szcintillációs számláló kísérlet megvalósításában döntött.
          </p>
          <p>
            A kísérlet föld körüli pályán van és sikeresen teljesítette
            célkitűzését.
          </p>
        </div>

        <h2 className="mt-14 text-4xl font-semibold sm:text-4xl">A csapat</h2>

        <div className="mt-10 grid w-full grid-cols-1 justify-items-center gap-10 md:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="flex h-full max-h-[600px] flex-col items-center gap-4 text-center"
            >
              <div className="w-[200px] h-[260px] flex flex-col items-center">
                <Image
                  src={member.image}
                  alt={member.name}
                  width={200}
                  height={260}
                  className="w-auto h-full object-cover"
                  sizes="(max-width: 768px) 200px, (max-width: 1024px) 220px, 240px"
                  priority
                />
              </div>
              <div className="flex flex-col items-center gap-1">
                <p className="text-base font-semibold text-white">
                  {member.name}
                </p>
                <p className="text-base italic text-white/80">{member.role}</p>
                <p className="text-sm italic text-white/70 whitespace-pre-line">
                  {member.education}
                </p>
              </div>
              <p className="text-sm leading-relaxed text-white/60 whitespace-pre-line">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
