# YouMath → PDF

Bookmarklet per salvare in PDF le lezioni di [YouMath](https://www.youmath.it) con un'impaginazione pulita da dispensa.

## Perché

- **PrintFriendly perde le formule.** Le formule inline di YouMath sono piccole immagini GIF (es. la lettera *A* è 13×13 px). PrintFriendly scarta le immagini così piccole e nel PDF compaiono frasi come "settore iperbolico avente area…" senza la *A*.
- **Ctrl+P dà una pagina bianca.** Il CSS di stampa del sito nasconde il contenuto.

Il bookmarklet copia solo l'articolo in una nuova finestra con un proprio foglio di stile di stampa, quindi entrambi i problemi spariscono.

## Cosa fa

- Mantiene **tutte** le formule, anche le più piccole, allineate nel testo.
- Toglie menu, breadcrumb, pubblicità, frecce di navigazione e tag.
- Aggiunge un'intestazione con titolo, autore, data di aggiornamento e link alla fonte.
- **Impagina da sé in pagine A4**, quindi il risultato non dipende dalle impostazioni di stampa del browser (margini, intestazioni):
  - margini fissi, intestazione corrente e numeri di pagina `n / N`;
  - un titolo non resta mai solo in fondo a una pagina, e un paragrafo resta sulla stessa pagina della formula che introduce;
  - se un grafico non ci sta, prima si rimpicciolisce un poco; se non basta passa alla pagina dopo e il testo della stessa sezione riempie lo spazio;
  - la tabella "goniometriche vs iperboliche" sta intera su una pagina più larga, con le colonne affiancate (si divide in più pagine, con "(continua)", solo se diventerebbe illeggibile).
- Mostra un'anteprima delle pagine prima della stampa, con un pulsante "Salva come PDF".

## Installazione

**Metodo facile:** apri la [pagina di installazione](https://robertoreale.github.io/youmath-pdf/) e trascina il pulsante nella barra dei preferiti.

**Metodo manuale:** crea un nuovo segnalibro e incolla nel campo URL il contenuto di [`bookmarklet.txt`](bookmarklet.txt).

## Uso

1. Apri una lezione su youmath.it.
2. Clicca il segnalibro. Si apre l'anteprima delle pagine e poi la finestra di stampa.
3. Scegli **Salva come PDF**. Margini e intestazioni li gestisce lo script: non serve toccare altre impostazioni.

Se non si apre nulla, consenti i pop-up per youmath.it.

## Sviluppo

Il codice leggibile è in [`src/youmath-pdf.js`](src/youmath-pdf.js). Dopo una modifica:

```bash
npm install
npm run build   # rigenera bookmarklet.txt e index.html
```

Il build minifica lo script con terser e codifica `%` e `#`, che nei segnalibri verrebbero interpretati dal browser.

## Struttura

```
src/youmath-pdf.js          sorgente leggibile del bookmarklet
build.js                    genera bookmarklet.txt e index.html
site/index.template.html    modello della pagina di installazione
bookmarklet.txt             riga da incollare nel segnalibro (generata)
index.html                  pagina di installazione per GitHub Pages (generata)
```

## Nota

Progetto indipendente, non affiliato a YouMath né a Math Industries Srl. Lo strumento non scarica né ridistribuisce contenuti: impagina la pagina che stai già leggendo nel tuo browser, per uso personale di studio. I contenuti delle lezioni restano di © Math Industries Srl e non vanno ripubblicati.

## Licenza

[MIT](LICENSE)
