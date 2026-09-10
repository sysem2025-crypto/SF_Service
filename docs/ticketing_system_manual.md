# Manuale d'Uso: Sistema di Ticketing

## 1. Introduzione
    *   **1.1 Scopo del Sistema:** Descrivere brevemente a cosa serve il sistema di ticketing (es. gestione richieste di assistenza, segnalazione problemi, tracciamento attività).
    *   **1.2 Destinatari:** A chi è rivolto il manuale (es. Utenti finali, Tecnici, Amministratori).
    *   **1.3 Glossario:** Spiegazione dei termini chiave (es. Ticket, Stato, Priorità, Assegnato a, Responsabile).

## 2. Ruoli e Permessi
    *   **2.1 Ruoli del Sistema:**
        *   **Utente (User):** Utenti che hanno completato con successo il processo di registrazione e approvazione. Possono creare e gestire i propri ticket, visualizzare lo stato delle loro richieste e aggiungere commenti. Non hanno accesso ai ticket di altri utenti né alle funzionalità amministrative.
        *   **Amministratore (Admin):** Utenti con privilegi elevati. Possono gestire *tutti* i ticket (visualizzare, assegnare, modificare stato/priorità, chiudere), nonché gestire il ciclo di vita degli utenti, approvando o rifiutando le nuove registrazioni.
    *   **2.2 Processo di Registrazione e Approvazione:**
        *   La registrazione di un nuovo utente avviene tramite la pagina di registrazione (`/register`).
        *   Ogni richiesta di registrazione crea un record di "Approvazione in Sospeso" (`Pending Approval`). Questa richiesta viene registrata internamente e, presumibilmente, invia una notifica agli Amministratori.
        *   Le nuove registrazioni **non** creano account utente attivi immediatamente. Rimangono in uno stato "in attesa di approvazione".
        *   Un Amministratore deve accedere all'area dedicata (es. `/admin/approvals`) per rivedere le richieste in sospeso.
        *   L'Amministratore può approvare o rifiutare ogni richiesta. Solo le richieste approvate attivano la creazione dell'account utente effettivo con ruolo `"user"`. Le password vengono gestite in modo sicuro tramite hashing.

## 3. Creare un Nuovo Ticket (per Utenti Finali e Tecnici)
    *   **3.1 Accesso alla Funzione:** La creazione di un nuovo ticket è accessibile tramite la pagina `ticket/nuovo` o tramite un link dedicato nel portale.
    *   **3.2 Compilazione dei Campi:**
        *   `id`: (Generato automaticamente dal sistema al momento della creazione).
        *   `titolo`: Un riassunto conciso del problema o della richiesta. Deve essere chiaro e immediato.
        *   `cliente`: Selezionare il cliente dall'elenco disponibile (es. Energuias, AIUT, Novareti).
        *   `stato`: All'apertura, questo campo viene automaticamente impostato su `"in_analisi"`. Gli stati osservati e previsti per il ciclo di vita di un ticket includono:
            *   `in_analisi`: Ticket appena creato, in fase di valutazione iniziale.
            *   `in_attesa_cliente`: Richiesta di ulteriori informazioni al cliente.
            *   `risposta_inviata`: Una risposta è stata fornita al cliente, si attende un suo riscontro.
            *   `in_lavorazione`: (Ipotizzato) Il ticket è attivamente gestito dal team tecnico.
            *   `risolto`: La problematica è stata risolta o la richiesta è stata soddisfatta.
            *   `chiuso`: Il ticket è stato finalizzato e archiviato.
        *   `priorita`: Indicare la priorità della richiesta. I livelli validi sono: `P1` (Critica), `P2` (Alta), `P3` (Media), `P4` (Bassa).
        *   `responsabile`: Campo che può indicare un referente interno (es. GP, MB) o un contatto primario associato al cliente o al ticket.
        *   `assegnato_a`: Campo multiplo che indica uno o più tecnici specificamente incaricati della risoluzione del ticket (es. `[GP]`, `[GP, MB]`). Può essere gestito dall'Amministratore.
        *   `data_apertura`: (Impostata automaticamente alla data e ora correnti).
        *   `ultimo_aggiornamento`: (Aggiornato automaticamente ad ogni modifica del ticket).
        *   `canale_ingresso`: Specificare il metodo con cui è stata ricevuta la richiesta. Canali comuni includono:
            *   `email`
            *   `meeting`
            *   `Portale Web`
            *   `Telefono`
            *   `Altro` (per casistiche non previste)
        *   `prodotto`: Indicare il prodotto o servizio associato al ticket (es. "Modus Configurator", "G Log EVC", "Modus Slim 2").
        *   `serial_number`: Inserire il numero di serie del prodotto, se pertinente (es. "001657-2019").
        *   `impianto`: Identificativo dell'impianto, se pertinente (es. "Texnopark", "Rovereto").
        *   `contatto_cliente`: Nome del referente del cliente che ha segnalato il problema (es. "Nitin Sangle", "Supporto Energuias").
        *   `email_cliente`: Indirizzo email del referente del cliente, se disponibile (es. "nsangle@aiut.com").
        *   `scadenza_sla`: Indicare la data di scadenza del Service Level Agreement, se applicabile.
        *   `tags`: Utilizzare parole chiave per categorizzare il ticket e facilitare le ricerche future (es. `["backup", "firmware"]`, `["comunicazione", "sim", "retry"]`).
        *   `allegati`: Campo previsto per il caricamento di file associati al ticket (es. log, screenshot). Negli esempi analizzati, questo campo è stato trovato vuoto (`[]`), suggerendo che potrebbe essere una funzionalità opzionale o non ancora ampiamente utilizzata.
    *   **3.3 Dettagli della Richiesta (Contenuto Markdown):**
        Il corpo del ticket è strutturato in sezioni Markdown che offrono spazio per una documentazione dettagliata del problema e delle azioni intraprese. L'uso completo di queste sezioni è fondamentale per una gestione efficace dei ticket:
        *   `## Richiesta iniziale`: **Obbligatorio.** Descrizione completa del problema, richiesta o segnalazione. Dettagliare sintomi, passaggi per riprodurre il problema, impatto sul business/servizio.
        *   `## Diagnosi iniziale`: (Campo opzionale, tipicamente compilato da Amministratori/Tecnici) Prima analisi del problema, ipotesi sulla causa radice, e prime direzioni di indagine.
        *   `## Azioni richieste al cliente`: (Campo opzionale) Usato per specificare chiaramente le informazioni o le azioni necessarie dal cliente per procedere (es. fornire file di log, screenshot, esecuzione di verifiche specifiche, conferme).
        *   `## Azioni eseguite internamente`: (Campo opzionale) Documentazione delle attività di analisi, test, configurazione o risoluzione svolte dal team tecnico interno.
        *   `## Timeline`: (Campo opzionale, potenzialmente compilato automaticamente) Una tabella per tracciare gli eventi chiave del ticket (data, autore, stato, note). Questo aiuta a mantenere una cronologia chiara degli sviluppi.
        *   `## Esito`: (Campo opzionale, da compilare alla chiusura del ticket) Riassunto della soluzione finale fornita, della causa radice identificata, o delle azioni conclusive intraprese.
    *   **3.4 Salvataggio del Ticket:** Una volta compilati i campi obbligatori e forniti i dettagli necessari, il ticket viene creato. L'utente riceverà una conferma (presumibilmente via email) e il ticket sarà visibile nella sua lista personale.

## 4. Gestione dei Ticket (per Utenti Finali)
    *   **4.1 Visualizzare i propri Ticket:**
        *   Accedere alla sezione "I miei ticket" (tramite navigazione su `/my-tickets` o da un link nell'area utente).
        *   Verrà visualizzata una tabella riassuntiva contenente i ticket creati dall'utente loggato. Le colonne includono: `ID`, `Cliente`, `Titolo`, `Priorita`, `Stato` (con una descrizione leggibile come "In analisi", "In attesa cliente", "Risolto"), e `Aperto` (data di apertura).
    *   **4.2 Interagire con i propri Ticket:**
        *   *(Comportamento atteso per un manuale d'uso ottimale):* Sebbene le pagine analizzate mostrino principalmente una vista riassuntiva per l'utente, si presume che cliccando su un ticket dalla tabella o tramite un link dedicato, l'utente possa accedere a una vista di dettaglio dei *propri* ticket.
        *   Da questa vista di dettaglio, l'utente dovrebbe essere in grado di:
            *   Visualizzare tutte le informazioni del ticket, inclusi stato, priorità, assegnatari, e dettagli tecnici.
            *   Aggiungere commenti o aggiornamenti testuali per fornire ulteriori informazioni o rispondere a richieste del tecnico.
            *   Visualizzare la cronologia delle modifiche o una timeline degli eventi relativi al ticket.
            *   (Potenzialmente) Caricare nuovi allegati se necessario.
            *   (Potenzialmente) Modificare alcuni campi del ticket, come la priorità o l'aggiunta di tag, se permesso dal sistema.
    *   **4.3 Creare un Nuovo Ticket:**
        *   Se non sono presenti ticket aperti, dalla pagina "I miei ticket" è disponibile un pulsante o link per avviare il processo di creazione di un nuovo ticket. Altrimenti, il processo si avvia come descritto nella Sezione 3.

## 5. Gestione dei Ticket (per Amministratori)
    *   **5.1 Dashboard Amministrativa:** Gli Amministratori accedono a funzionalità avanzate che richiedono autenticazione con ruolo `"admin"`.
    *   **5.2 Visualizzazione Dettagliata di Tutti i Ticket:**
        *   Gli Amministratori possono accedere alla vista dettagliata di *qualsiasi* ticket tramite la pagina `/ticket/[slug]`, dove `[slug]` è un identificatore univoco del ticket.
        *   Questa vista presenta tutte le informazioni del ticket: `ID`, `Titolo`, `Stato`, `Priorita`, `Cliente`, `Prodotto`, `Impianto`, `Seriale`, `Referente`, `Email`, `Aperto`, `Aggiornato`, `SLA`, `Responsabile`, `Assegnato a` e il contenuto completo del ticket in formato Markdown.
        *   Gli stati dei ticket sono visualizzati direttamente nel loro formato grezzo (es. `in_analisi`, `in_attesa_cliente`, `risposta_inviata`).
    *   **5.3 Assegnazione e Gestione Ticket:**
        *   **Assegnazione Tecnica:** L'Amministratore può assegnare uno o più tecnici al ticket modificando il campo `assegnato_a` nella vista dettagliata del ticket. Questo indica chi sta attivamente lavorando sul ticket.
        *   **Definizione del Responsabile:** Il campo `responsabile` può essere utilizzato per indicare un contatto interno primario o un gestore assegnato al cliente o al ticket, distinguendosi dagli `assegnato_a` che sono i tecnici esecutori.
        *   **Modifica Stato e Priorità:** Dalla vista dettagliata del ticket, l'Amministratore può modificare lo `stato` (es. da "in_analisi" a "in_lavorazione", "risolto", "chiuso") e la `priorita` del ticket.
        *   **Aggiornamento Informazioni:** È possibile aggiornare campi quali `cliente`, `prodotto`, `impianto`, `contatto_cliente`, `email_cliente`, `scadenza_sla`, `responsabile` e `tags`.
    *   **5.4 Aggiornamento del Contenuto e Chiusura:**
        *   Gli Amministratori hanno accesso completo alla modifica della sezione Markdown del ticket. Possono compilare o aggiornare campi come:
            *   `## Diagnosi iniziale`: Valutazioni tecniche e ipotesi.
            *   `## Azioni eseguite internamente`: Documentazione delle attività svolte.
            *   `## Esito`: Riassunto della soluzione o causa radice alla chiusura.
        *   La chiusura di un ticket (impostando lo stato a "chiuso" o "risolto") comporta la compilazione della sezione `## Esito`.
    *   **5.5 Gestione Utenti e Approvazioni:** (Vedere Sezione 2.2).

## 6. Allegati
    *   Il sistema prevede la possibilità di allegare file a un ticket per fornire documentazione aggiuntiva (es. log di sistema, screenshot di errori, configurazioni).
    *   Il campo `allegati` è presente nella struttura del ticket. Negli esempi analizzati, questo campo è stato trovato vuoto (`[]`), suggerendo che la funzionalità potrebbe essere in fase di implementazione o utilizzata in contesti specifici non rappresentati nei dati campione.
    *   Per un uso ottimale, si consiglia di caricare file pertinenti per supportare la diagnosi e la risoluzione del problema.
    *   *(Nota per lo sviluppo: specificare i limiti di dimensione, numero di file e tipi di file supportati).*

## 7. Best Practices
    *   **Per la Creazione di un Nuovo Ticket:**
        *   **Titolo Chiaro e Conciso:** Usare titoli che riassumano il problema in modo immediato (es. "Errore 500 durante il login", "Richiesta installazione Modbus Slim 2").
        *   **Descrizione Dettagliata:** Fornire tutte le informazioni rilevanti nel campo `## Richiesta iniziale`. Includere messaggi di errore esatti, passaggi per riprodurre il problema, impatto sul business.
        *   **Selezione Corretta di Campi:** Compilare con precisione `cliente`, `prodotto`, `priorita` e `canale_ingresso`.
        *   **Utilizzo dei Tag:** Usare tag pertinenti per facilitare la categorizzazione e la ricerca (es. `["firmware", "backup"]`).
    *   **Per la Gestione dei Ticket (Amministratori/Tecnici):**
        *   **Aggiornamenti Frequenti:** Mantenere aggiornati `stato`, `assegnato_a`, e aggiungere note nelle sezioni appropriate (`## Diagnosi iniziale`, `## Azioni eseguite internamente`).
        *   **Comunicazione Chiara:** Utilizzare `## Azioni richieste al cliente` per comunicare chiaramente le necessità al cliente.
        *   **Documentazione Completa:** Compilare sempre la sezione `## Esito` alla chiusura di un ticket per mantenere uno storico utile.
        *   **Gestione SLA:** Monitorare e rispettare le `scadenza_sla`.
    *   **Per la Visualizzazione dei Ticket (Utenti Finali):**
        *   Verificare regolarmente la pagina "I miei ticket" per aggiornamenti sullo stato delle proprie richieste.
        *   Rispondere prontamente alle richieste di informazioni specificate nel campo `## Azioni richieste al cliente`.
    *   **Interazione Utente:**
        *   È previsto che gli utenti finali possano visualizzare i dettagli dei propri ticket e aggiungere commenti o aggiornamenti testuali. Questa interazione dovrebbe avvenire tramite una vista di dettaglio dedicata agli utenti, che permetta anche di caricare allegati e visualizzare la cronologia degli eventi.
