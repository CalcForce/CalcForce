# Elatusapulaskurin testit

Node.js 24 tai uudempi:

```sh
npm ci
npm test
npm run test:refactor
```

## Testisarjat

- `elatusapulaskuri.test.cjs`: 10 laskentatestiä nykyisillä nettotulo- ja vähennyskentillä.
- `elatusapulaskuri-dom.test.cjs`: CSS:n jäsennys, sovelluksen sisäiset 24 testiä ja 10 DOM-toimintatarkistusta (summat, syöteraja, kohdistus, lapsen lisäys/poisto, valikko ja teemat).
- `elatusapulaskuri-compat.test.cjs`: 7 yhteensopivuustarkistusta vanhoille, nykyisille ja molempia tietomuotoja sisältäville laskelmille. Mukana avoimien osioiden säilyminen, nimien HTML-suojaus ja tyhjät listat.
- `elatusapulaskuri-refactor.test.cjs`: vertailu version 0.560 commitiin `60abf375731b79fe90a7e7abf0d2f434619f9d1a`. Tarkistaa 72 laskentatapausta, oletuskorttien HTML:n ja 30 leveys-/teema-/tulostustilayhdistelmän edustavat tyylit. Vertailutesti tarvitsee Git-historian, jossa kyseinen commit on saatavilla.

DOM-testit käyttävät jsdomia: ne eivät renderöi sivua eivätkä varmista pikselitason vastaavuutta. Tyylivertailussa mediaehdot valitaan testin leveys- ja tulostustilan perusteella ennen jsdomin laskettujen tyylien vertailua. Tämä ei korvaa visuaalista mobiili- tai tulostustarkistusta selaimessa. Testit eivät vahvista laskentaperusteiden oikeudellista oikeellisuutta.

## Version 0.561 rakenne

- `renderCardList` ja `captureCardView` hoitavat molempien korttilajien yhteisen elinkaaren. Kenttäsovitin valitaan tietuekohtaisesti, jotta vanhat ja uudet tietueet voivat esiintyä yhdessä.
- `numericField`, `ageOptions` ja `ageCosts` tarjoavat yhteiset kentät ja ikäryhmät.
- `createRevisedChild` alustaa sekä esimerkkilapset että uudet lapsikortit.
- `parentCardTotals` ja `childCardTotals` ovat yhteiset summien lähteet kortin luonnissa ja päivityksessä.
- CSS:stä poistettiin 45 myöhemmin ylikirjoitettua määritystä ja yhdistettiin yhdeksän sääntöparia. Osa samojen valitsimien säännöistä säilyy eri kohdissa lähdejärjestyksen ja responsiivisten ohitusten vuoksi. CSS on muotoiltu sääntö- ja ominaisuuskohtaisille riveille.

Kohdan 3 tuloslaskentaa ei palauteta. Vanhojen tietueiden arvoja ei muuteta automaattisella migraatiolla.
