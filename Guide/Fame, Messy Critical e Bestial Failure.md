
| **Condizione**                                            | **Descrizione / Logica**                                                                                                        | **Requisiti logici**                                                                  | **Etichetta**                |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------- |
| 🎯 **Critico**                                            | Ottieni **uno o più 10** e **nessun 1**. È un successo eccezionale (azione perfetta o elegante).                                | `tens >= 1` e `ones == 0`                                                             | `Critico`                    |
| 💥 **Messy Critical** _(concetto V5 importato)_           | Hai **esattamente un 10**, **nessun 1**, **e sei Affamato**. Il successo è potente ma incontrollato, con conseguenze narrative. | `tens == 1` e `ones == 0` e `Fame = true`                                             | `Messy Critical`             |
| ✅ **Successo / Successi**                                 | Hai **uno o più successi** senza 10 (o con 10 ma accompagnati da 1). È un risultato positivo standard.                          | `successes_final >= 1` e `tens == 0` o (`tens > 0` e `ones > 0`)                      | `X Successi`                 |
| ⚠️ **Successo Disordinato** _(ibrido)_                    | Hai **solo 1 successo** e sei **Affamato**. Il successo è ottenuto ma con perdita di controllo o difficoltà.                    | `successes_final == 1` e `Fame = true`                                                | `Successo Disordinato`       |
| ❌ **Fallimento**                                          | Nessun successo e nessun 1, oppure i 1 hanno cancellato tutti i successi. È un fallimento “pulito”.                             | `successes_final == 0` e `ones == 0` o (`successes_raw > 0` e `successes_final == 0`) | `Fallimento`                 |
| 💀 **Fallimento Critico (Botch)** _(regola classica V20)_ | Nessun successo e almeno un 1. Conseguenze negative significative.                                                              | `successes_final == 0` e `ones > 0` e `Fame = false`                                  | `Fallimento Critico (Botch)` |
| 🩸 **Fallimento Bestiale** _(concetto V5 integrato)_      | È un **Botch** ma in **condizione di Fame**. Fallimento estremo, incontrollato o predatorio.                                    | `successes_final == 0` e `ones > 0` e `Fame = true`                                   | `Fallimento Bestiale`        |

#### Fame

1. Fame quando hai i punti sangue sotto il livello 7-Autocontrollo sei affamato


### Esempi

|Tipo di tiro|Condizione|Esempio narrativo|
|---|---|---|
|✅ **Successo**|Hai almeno 1 successo|Riesci a scassinare la porta.|
|❌ **Fallimento**|Nessun successo e nessun 1|La serratura resiste, ma non succede nulla.|
|💀 **Botch**|Nessun successo + 1|Spezzi il grimaldello, blocchi la serratura.|
|🩸 **Fallimento Bestiale**|Botch + Fame attiva|Ti arrabbi, graffi la porta, fai rumore, la Bestia emerge.|
