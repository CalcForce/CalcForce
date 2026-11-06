# Elatusapulaskuri v0.517: laskentakaavojen auditointi (6.11.2026)

## Tarkastelun rajaus
Lähdekoodin staattinen tarkistus verrattuna oikeusministeriön suosituksiin. Tämä ei ole lastenvalvojan hyväksymä laskelma eikä euro-eurosta vertailu Lapha-laskuriin. **Laskentakaavoja ei muutettu auditoinnissa.**

Lähteet:
- OM 2007:2: https://julkaisut.valtioneuvosto.fi/items/1c595158-1828-4d8f-ac47-8245d491cf02
- OM 2023:24: https://julkaisut.valtioneuvosto.fi/items/a256571c-7b6e-4079-a80c-dcfe1a2658b6

## Löydökset

### Kriittinen: laskentafunktioiden riippuvuus globaalista tilasta
- `computeSupportModel(parents,children)` välittää argumentit `allocate`-funktiolle, mutta `capacity(p)` kutsuu `parentHousingShare(p)` ilman annettuja vanhempi- ja lapsilistoja. `parentHousingShare` käyttää oletuksena `state.parents` ja `state.children`.
- `benefitFor(c,children)` kutsuu `singleParentBenefit(c)`, joka hakee vanhemman suoraan `state.parents`-taulukosta.
- Seurauksena toisilla syötteillä laskettujen skenaarioiden tulokset voivat riippua käyttöliittymän senhetkisestä tilasta. Korjattava ennen itsenäisen laskentamoottorin luotettavaa testausta.

### Merkittävä: tuloveron arvio
- `estimatedTax(gross)` käyttää itse määriteltyjä tuloveroportaita. Se ei ole verokortti- eikä verohallinnon laskenta.
- Todelliset verot ja pakolliset maksut voivat poiketa merkittävästi; käsin syötettävä todellinen nettotulo tai todellisiin maksuihin perustuva erittely olisi luotettavampi.

### Merkittävä: luontoisedut ja asuminen
- `capacity` vähentää luontoisetujen verotusarvon bruttotulosta rahatulon arvioinnissa ja lisää asuntoedun taloudellista hyötyä erillisillä valinnoilla.
- `imputedBenefitHousing` arvioi asuntoedusta lapselle kohdistuvaa asumishyötyä.
- Näiden yhteensopivuus ja mahdollinen kaksinkertainen huomiointi on tarkistettava konkreettisilla laskuesimerkeillä.

### Merkittävä: vuoroasuminen
- `allocate` sisältää erillisen vuoroasumishaaran, joka jakaa päivittäisiä kustannuksia ja asumiskuluja molemmille vanhemmille; `deduction:0` on yhdenmukainen vuoden 2023 ohjeen periaatteen kanssa.
- Laskennan rahamääräinen oikeellisuus ja kustannusten kohdentuminen tarvitsevat virallisiin esimerkkilaskelmiin perustuvat testit.

### Merkittävä: lapsilisät
- `baseBenefitFor` käyttää sisarusten järjestysnumeroon perustuvaa taulukkoa, `underThreeBenefit` kiinteää lisää ja `singleParentBenefit` kiinteää yksinhuoltajakorotusta.
- Etuuksien voimassaolo, ikärajat, perhekohtainen sisarusjärjestys ja se, kenen lapsista etuudet määräytyvät, on varmistettava Kelan ajantasaisista perusteista.

### Tarkistettava: muut lapset ja sopimukset
- `agreementMode==='agreed'` luo sovitun prosentti- tai euromääräisen elatusvastuun, joka vaikuttaa muiden lasten elatuskykyyn.
- On varmistettava, ettei samaa velvollisuutta vähennetä lisäksi `otherChildren`-kentässä ja että sovitun osuuden käsittely vastaa todellista elatusvastuuta.

### Tarkistettava: luonapitovähennys
- `automaticCareDeduction` käyttää 2026-taulukkoa ja yöpymisrajoja 7/10/13/16. Taulukon indeksikorotukset ja tarkat soveltamisedellytykset on tarkistettava lähdeaineistosta.

## Korjausjärjestys
1. Poista globaalin `state`-tilan riippuvuudet laskennan sisältä, siirrä `parents` ja `children` kaikille alifunktioille.
2. Tee virallisista esimerkeistä vertailutestit erikseen tavalliselle ja vuoroasuvalle lapselle.
3. Tarkista lapsilisien ja luonapitovähennysten ajantasaiset euromäärät.
4. Selvitä asuntoedun, asumiskulujen ja muiden lasten elatusvastuun käsittely esimerkeillä.
5. Merkitse tulokset alustaviksi, kun verot tai etuudet perustuvat arvioon.

## Auditoinnin tila
Osittainen, koodiin perustuva poikkeama-analyysi. **Ei vielä osoita täyttä ohjeenmukaisuutta.** Ei muutoksia tuotantolaskentaan.
