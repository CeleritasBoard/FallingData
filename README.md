# Falling Data
A Celeritas projekt webes felületei. A projekt két részből áll:
- Outreach - a rendszer publikusan elérhető arca, ahol a projektről "mesélünk". Itt érhetőek el a mérési eredményeink illetve az eszközök legutóbbi ismert státusza is
- Houston - a küldetésirányítási központ mely csak a csapat tagjai számára elérhető

## A projekt technikai felépítése
### Felhasznált technológiák
- Back-end (adatbázis, automatizációk, authentication): [Supabase](https://supabase.com)
- Front-end (grafikus felületek): [Next.JS](https://nextjs.org/docs) (framework) + [TailwindCSS](https://tailwindcss.com/) (CSS toolset) + [ShadCN](https://ui.shadcn.com/docs/) (react komponensek gyűjteménye) + TypeScript (JavaScript csak classokal)
- Build tool: [Turborepo](https://turborepo.com)
### A projekt struktúrája
A projekt egy monorepóként tartalmazza mind a Houston, mind az Outreach rendszerekhez tartozó kódokat, így elősegítve a rendszerek közötti lehető legnagyobb átfedést.
```
falling-data
  - .github - CI/CD pipelines, github specific stuff
  - apps
	  - houston - Houston's codebase
	  - outreach - Outreach's codebase
  - packages
	  - shared - shared utilities
	  - ui - shadCN components
	  - tailwind-config - tailwindCSS global config
  - supabase - everything supabase related
	  - schemas - database definitions
	  - functions - automatizations
		  - function 1 - a simple function
```

## Fejlesztői környezet létrehozása saját eszközökön
Alább a helyi fejlesztői környezet leírása található, a lehető legplatformfüggetlenebb módon:
1. Telepítsd a következő szoftvereket
	- [NodeJS](https://nodejs.org/en/download) - a JavaScript/TypeScript interpreter
	- [PNPM](https://pnpm.io/installation) - npm, but better
	- [Docker](https://docs.docker.com/get-started/get-docker/) - virtualizációs eszköz, a supabase-hez kell
	- [JetBrains WebStorm](https://www.jetbrains.com/webstorm/) - az IDE (VSCode szteroidokon 💪)
	- [Git](https://git-scm.com/downloads) - verziókezelő szoftver (ha eddig nem volt rajta a gépeden)
2. Forkold és klónold a forkodat
3. Telepítsd a projekt függőségeit
	```sh
	pnpm install
	```
4. Indítsd el a supabase-t. Az első indítás sokáig tarthat, mert a dockernek le kell töltenie a supabaset.
	```sh
	pnpx supabase start
	# Leállítás:
	pnpx supabase stop
	```
5. Frissítsd az anon kulcsot a projektekben.
	1. A supabase indítása után kiír egy rakat infót. Abban van egy anon key sor. Másold ki.
	2. Hozz létre egy `apps/houston/.env.local` fájlt a következő tartalommal:
		```
		# Update these with your Supabase details from your project settings > API
         NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
            NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key
        ```
	3. Ismételd meg a 2. lépést a `apps/outreach/.env.local` fájjlal
6. Indítsd el a webes felület teszt szerverét
	```bash
	pnpm run dev
	```
7. Kész
