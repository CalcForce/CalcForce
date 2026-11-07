# Elatusapulaskurin testit

Node.js 24 tai uudempi:

```sh
npm ci
npm test
```

- `elatusapulaskuri.test.cjs`: 10 laskentatestiä nykyisillä nettotulo- ja lapsen vähennyskentillä. Odotusarvot vastaavat sovelluksen esimerkkitietoja.
- `elatusapulaskuri-dom.test.cjs`: CSS:n jäsennys, sovelluksen sisäiset 24 testiä sekä 10 DOM-toimintatarkistusta (summat, syöteraja, kohdistus, lapsen lisäys/poisto, valikko ja teemat). Myös DOM-ajonaikaiset virheet pysäyttävät testin.

DOM-testit käyttävät jsdomia: ne eivät renderöi sivua eivätkä varmista mobiiliasettelua, tulostusulkoasua tai pikselitason vastaavuutta. Chromiumin käynnistys estyi korjausympäristössä, joten version 0.560 visuaalista selainvertailua ei tehty. Testit eivät vahvista laskentaperusteiden oikeudellista oikeellisuutta.

Versio 0.560 korjaa rikkinäiset CSS-valitsimet, korttien summien päivittymisen, sovitun prosenttiosuuden ylärajan sekä uuden lapsikortin tietomallin ja automaattisen avaamisen. Kohdan 3 tuloslaskentaa ei palauteta.
