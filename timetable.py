from ortools.sat.python import cp_model

#Alle Flags 
FRUESTUNDEN_BEVORZUGEN = 1
BLOCKBILDUNG = 1

# Alle Konvigurationseinstellungen
MAX_STUNDEN_PRO_TAG = 2 # Maximal x Stunden pro Tag für ein Fach

MAX_STUNDEN_OHNE_PAUSE = 7 # Maximal x Stunden ohne Pause
PAUSENFENSTER = range(4, 7)  # Das ist die x+1 bis y Stunde (nullbasiert)

fach_max_parallel = [('Sport', 3), ('Chemie', 3), ('Bio', 3), ('Physik', 3)]  # Beispiel: Sport darf höchstens 3x gleichzeitig stattfinden -> ('Sport', 3)


MAX_TIME_FOR_SOLVING = 60 * 3  # Maximal x Sekunden für die Lösungssuche


#Alle Gewichtungen
GEWICHT_BLOCKBILDUNG = 10  # Gewichtung für Doppelstunden
GEWICHT_Stunden = 10  # Gewichtung für frühe/späte Stunden Bevorzugung

# Basisdaten
tage = ['Mo', 'Di', 'Mi', 'Do', 'Fr']
stunden_pro_tag = 10
klassen = ['K1', 'K2', 'K3', 'K4', 'K5', 'K6']
faecher = ['Mathe', 'Deutsch', 'Englisch', 'Sport', 'Bio', 'Chemie', 'Physik', 'Geschichte']
fach_indices = {fach: i for i, fach in enumerate(faecher)}  # Indizes der Fächer in der Form {Fach: Index}

lehrer_info = {
    'Maier': {'faecher': ['Mathe', 'Physik'], 'max_stunden': 18},
    'Schulz': {'faecher': ['Deutsch', 'Geschichte'], 'max_stunden': 20},
    'Hoffmann': {'faecher': ['Englisch', 'Geschichte'], 'max_stunden': 20},
    'Meyer': {'faecher': ['Sport', 'Bio'], 'max_stunden': 18},
    'Tesla': {'faecher': ['Mathe', 'Chemie'], 'max_stunden': 18},
    'Weber': {'faecher': ['Deutsch', 'Bio'], 'max_stunden': 20},
    'Schmidt': {'faecher': ['Englisch', 'Mathe', 'Physik'], 'max_stunden': 22},
    'Krüger': {'faecher': ['Chemie', 'Bio'], 'max_stunden': 18},
    'Neumann': {'faecher': ['Deutsch', 'Englisch', 'Geschichte'], 'max_stunden': 20},
    'LenBauer': {'faecher': ['Sport', 'Physik'], 'max_stunden': 18},
}

# Beispielhafte Fachverteilung pro Klasse (du kannst das bei Bedarf variieren)
fachstunden = {
    'K1': {'Mathe': 4, 'Deutsch': 4, 'Englisch': 4, 'Sport': 2, 'Bio': 2, 'Chemie': 2, 'Physik': 3, 'Geschichte': 2},
    'K2': {'Mathe': 5, 'Deutsch': 4, 'Englisch': 4, 'Sport': 3, 'Bio': 2, 'Chemie': 3, 'Physik': 2, 'Geschichte': 2},
    'K3': {'Mathe': 5, 'Deutsch': 5, 'Englisch': 4, 'Sport': 2, 'Bio': 3, 'Chemie': 2, 'Physik': 3, 'Geschichte': 2},
    'K4': {'Mathe': 4, 'Deutsch': 4, 'Englisch': 5, 'Sport': 2, 'Bio': 2, 'Chemie': 3, 'Physik': 2, 'Geschichte': 3},
    'K5': {'Mathe': 5, 'Deutsch': 4, 'Englisch': 5, 'Sport': 3, 'Bio': 3, 'Chemie': 2, 'Physik': 3, 'Geschichte': 2},
    'K6': {'Mathe': 4, 'Deutsch': 5, 'Englisch': 4, 'Sport': 2, 'Bio': 2, 'Chemie': 2, 'Physik': 3, 'Geschichte': 3},
}


model = cp_model.CpModel() # Erstelle ein neues CP-Modell
# Variablen
# Stundenplan: (Klasse, Tag, Stunde) -> Fach
# is_belegt: (Klasse, Tag, Stunde) -> BoolVar
stundenplan = {}
is_belegt = {}
zielvariablen = []  # Liste zur Speicherung der Variablen für die Zielfunktion


# Baut die Variablenstruktur für den Stundenplan auf:
# Für jede Klasse, jeden Tag und jede Stunde wird:
# - eine Fach-Variable (var) erzeugt, die entweder ein Fach-Index (>= 0) oder -1 (freie Stunde) ist,
# - eine Bool-Variable (belegung), die angibt, ob der Slot belegt ist,
# - und beide Variablen werden logisch miteinander verknüpft, sodass sie konsistent sind.

for k in klassen:  # Iteriere über alle Klassen
    for t in range(len(tage)):  # Iteriere über alle Tage
        for s in range(stunden_pro_tag):  # Iteriere über alle Stunden pro Tag
            var = model.NewIntVar(-1, len(faecher) - 1, f'{k}_{t}_{s}')  # Fachindex oder -1 für frei
            belegung = model.NewBoolVar(f'belegt_{k}_{t}_{s}')  # Belegungsstatus (True/Falsch)
            model.Add(var >= 0).OnlyEnforceIf(belegung)  # Wenn belegt, dann muss var >= 0
            model.Add(var < 0).OnlyEnforceIf(belegung.Not())  # Wenn nicht belegt, dann var < 0
            stundenplan[(k, t, s)] = var  # Speichere Fach-Variable
            is_belegt[(k, t, s)] = belegung  # Speichere Belegungs-Variable

# Lehrer-Variable pro Zeitslot: Wer unterrichtet diese Stunde?
lehrer_indices = {lehrer: i for i, lehrer in enumerate(lehrer_info.keys())}
lehrerplan = {}  # (Klasse, Tag, Stunde) → Lehrerindex oder -1 (keiner)
for k in klassen:
    for t in range(len(tage)):
        for s in range(stunden_pro_tag):
            lehrerplan[(k, t, s)] = model.NewIntVar(-1, len(lehrer_info) - 1, f'lehrer_{k}_{t}_{s}')


# Für jedes Fach in jeder Klasse eine konstante Lehrer-Variable anlegen
# Diese Variable bestimmt, welcher Lehrer dieses Fach in dieser Klasse durchgehend übernimmt
konstanter_lehrer = {}

for k in klassen:
    for fach in fachstunden[k]:
        # Lehrer-Index von 0 bis Anzahl Lehrer - 1
        konstanter_lehrer[(k, fach)] = model.NewIntVar(0, len(lehrer_info) - 1, f'lehrer_fest_{k}_{fach}')


#Jede Klasse soll wenn sie über MAX_STUNDEN_OHNE_PAUSE Stunden unterrichtet wird, auch eine Pause haben
for k in klassen:  # Iteriere über alle Klassen
    for t in range(len(tage)):  # Für jeden Wochentag
        # Berechne, wie viele Stunden an diesem Tag belegt sind
        belegungen = [is_belegt[(k, t, s)] for s in range(stunden_pro_tag)]
        gesamt_belegt = model.NewIntVar(0, stunden_pro_tag, f'{k}_{t}_gesamt')
        model.Add(gesamt_belegt == sum(belegungen))  # Summe aller belegten Stunden an diesem Tag

        # Finde heraus, ob im Pausenfenster irgendwo eine Freistunde liegt
        pausenbedingungen = []  # Liste von Bedingungen, dass an mindestens einer Stelle im Fenster frei ist
        for s in PAUSENFENSTER:
            ist_frei = model.NewBoolVar(f'{k}_{t}_{s}_ist_frei')
            model.Add(is_belegt[(k, t, s)] == 0).OnlyEnforceIf(ist_frei)
            model.Add(is_belegt[(k, t, s)] == 1).OnlyEnforceIf(ist_frei.Not())
            pausenbedingungen.append(ist_frei)

        # Variable: Gibt es eine Pause im Pausenfenster?
        freipause = model.NewBoolVar(f'{k}_{t}_pause')
        model.AddBoolOr(pausenbedingungen).OnlyEnforceIf(freipause)
        model.AddBoolAnd([p.Not() for p in pausenbedingungen]).OnlyEnforceIf(freipause.Not())

        # Variable: Braucht die Klasse an diesem Tag überhaupt eine Pause?
        braucht_pause = model.NewBoolVar(f'{k}_{t}_braucht_pause')
        model.Add(gesamt_belegt > MAX_STUNDEN_OHNE_PAUSE).OnlyEnforceIf(braucht_pause)
        model.Add(gesamt_belegt <= MAX_STUNDEN_OHNE_PAUSE).OnlyEnforceIf(braucht_pause.Not())

        # Wenn eine Pause gebraucht wird, muss auch tatsächlich eine Freistunde im Fenster vorkommen
        model.Add(freipause == 1).OnlyEnforceIf(braucht_pause)


# Einschränkung: Lehrer brauchen bei zu vielen Unterrichtsstunden eine Pause im Pausenfenster
# Wenn ein Lehrer an einem Tag mehr als MAX_STUNDEN_OHNE_PAUSE unterrichtet,
# dann muss mindestens eine Freistunde im definierten PAUSENFENSTER liegen.

for lehrer, l_index in lehrer_indices.items():  # Für jeden Lehrer
    for t in range(len(tage)):  # Für jeden Tag
        belegungen = []  # Alle Slots, in denen dieser Lehrer unterrichtet

        for s in range(stunden_pro_tag):  # Für jede Stunde des Tages
            b = model.NewBoolVar(f'{lehrer}_{t}_{s}_belegt')  # Ist der Lehrer hier eingesetzt?
            
            # Der Lehrer ist eingesetzt, wenn er in einer der Klassen unterrichtet
            unterricht_in_k = []
            for k in klassen:
                in_klasse = model.NewBoolVar(f'{lehrer}_{t}_{s}_in_{k}')
                model.Add(lehrerplan[(k, t, s)] == l_index).OnlyEnforceIf(in_klasse)
                model.Add(lehrerplan[(k, t, s)] != l_index).OnlyEnforceIf(in_klasse.Not())
                unterricht_in_k.append(in_klasse)

            # Der Lehrer unterrichtet in dieser Stunde, wenn er in einer der Klassen unterrichtet
            model.AddBoolOr(unterricht_in_k).OnlyEnforceIf(b)
            model.AddBoolAnd([u.Not() for u in unterricht_in_k]).OnlyEnforceIf(b.Not())
            
            belegungen.append(b)

        # Zähle, wie viele Stunden der Lehrer an diesem Tag unterrichtet
        gesamt_belegt = model.NewIntVar(0, stunden_pro_tag, f'{lehrer}_{t}_gesamt')
        model.Add(gesamt_belegt == sum(belegungen))

        # Prüfe, ob es im Pausenfenster mindestens eine Freistunde gibt
        freipause = model.NewBoolVar(f'{lehrer}_{t}_pause')
        pausenbedingungen = []

        for s in PAUSENFENSTER:  # Für jede Stunde im Pausenfenster
            frei = model.NewBoolVar(f'{lehrer}_{t}_{s}_frei')  # Ist der Lehrer in dieser Stunde frei?

            nicht_in_k = []
            for k in klassen:
                not_in = model.NewBoolVar(f'{lehrer}_{t}_{s}_not_in_{k}')
                model.Add(lehrerplan[(k, t, s)] != l_index).OnlyEnforceIf(not_in)
                model.Add(lehrerplan[(k, t, s)] == l_index).OnlyEnforceIf(not_in.Not())
                nicht_in_k.append(not_in)

            # Der Lehrer ist in dieser Stunde frei, wenn er in keiner Klasse unterrichtet
            model.AddBoolAnd(nicht_in_k).OnlyEnforceIf(frei)
            model.AddBoolOr([ni.Not() for ni in nicht_in_k]).OnlyEnforceIf(frei.Not())

            pausenbedingungen.append(frei)

        # Lehrer hat eine Pause, wenn mindestens ein Slot im Pausenfenster frei ist
        model.AddBoolOr(pausenbedingungen).OnlyEnforceIf(freipause)

        # Lehrer braucht eine Pause, wenn er zu viele Stunden unterrichtet
        braucht_pause = model.NewBoolVar(f'{lehrer}_{t}_braucht_pause')
        model.Add(gesamt_belegt > MAX_STUNDEN_OHNE_PAUSE).OnlyEnforceIf(braucht_pause)
        model.Add(gesamt_belegt <= MAX_STUNDEN_OHNE_PAUSE).OnlyEnforceIf(braucht_pause.Not())

        # Wenn der Lehrer eine Pause braucht, dann muss freipause erfüllt sein
        model.Add(freipause == 1).OnlyEnforceIf(braucht_pause)



# Einschränkung: Begrenze die gleichzeitige Anzahl an Unterrichtseinheiten bestimmter Fächer.
# Hintergrund: Manche Fächer – etwa Sport oder Naturwissenschaften – benötigen spezielle Räume
# (z. B. Turnhalle, Chemielabor). Diese Räume stehen nur begrenzt zur Verfügung.
# Deshalb darf ein solches Fach systemweit (also über alle Klassen hinweg) pro Zeitslot
# nur eine bestimmte Anzahl an Malen gleichzeitig unterrichtet werden.

for fach, max_anzahl in fach_max_parallel:  # Für jedes Fach mit einer Parallelitätsbegrenzung
    f_index = fach_indices[fach]  # Fach-Index im Stundenplan

    for t in range(len(tage)):  # Für jeden Tag
        for s in range(stunden_pro_tag):  # Für jede Stunde

            gleichzeitige_unterrichtseinheiten = []  # Zählt, wie oft das Fach in diesem Zeitslot unterrichtet wird

            for k in klassen:  # Über alle Klassen
                b = model.NewBoolVar(f'{fach}_{k}_{t}_{s}_gleichzeitig')  # Ist das Fach zur Zeit in Klasse k aktiv?
                model.Add(stundenplan[(k, t, s)] == f_index).OnlyEnforceIf(b)  # Wenn ja, dann b=True
                model.Add(stundenplan[(k, t, s)] != f_index).OnlyEnforceIf(b.Not())  # Sonst b=False
                gleichzeitige_unterrichtseinheiten.append(b)

            # Begrenze: Dieses Fach darf zu diesem Zeitpunkt höchstens 'max_anzahl' Mal gleichzeitig vorkommen
            model.Add(sum(gleichzeitige_unterrichtseinheiten) <= max_anzahl)



# Für jede Klasse, jeden Tag und jede Stunde:
# Wir prüfen, ob ein bestimmtes Fach in diesem Slot liegt.
# Falls ja, erzwingen wir, dass der zugewiesene Lehrer dem zuvor festgelegten (konstanten) Lehrer für dieses Fach in dieser Klasse entspricht.
# Ziel: Ein Fach soll in einer Klasse immer vom gleichen Lehrer unterrichtet werden.

for k in klassen:
    for t in range(len(tage)):
        for s in range(stunden_pro_tag):
            fach_var = stundenplan[(k, t, s)]        # Das Fach, das in diesem Slot unterrichtet wird
            lehrer_var = lehrerplan[(k, t, s)]       # Der Lehrer, der in diesem Slot unterrichtet

            for fach in fachstunden[k]:              # Nur Fächer, die in der Klasse überhaupt unterrichtet werden
                f_index = fach_indices[fach]         # Index des Fachs (z. B. Mathe = 0, Deutsch = 1, ...)
                b = model.NewBoolVar(f'is_{fach}_{k}_{t}_{s}')  # Bool: Wird dieses Fach gerade unterrichtet?

                # Wenn das Fach in diesem Slot liegt, setze b auf True
                model.Add(fach_var == f_index).OnlyEnforceIf(b)

                # Wenn das Fach nicht in diesem Slot liegt, setze b auf False
                model.Add(fach_var != f_index).OnlyEnforceIf(b.Not())

                # Wenn b=True (also dieses Fach liegt an diesem Slot), 
                # dann muss der Lehrer dem vorher festgelegten Fachlehrer für diese Klasse entsprechen
                model.Add(lehrer_var == konstanter_lehrer[(k, fach)]).OnlyEnforceIf(b)




# Fügt Nebenbedingungen hinzu, die sicherstellen, dass jedes Fach in jeder Klasse
# genau so oft im Stundenplan vorkommt, wie in den fachstunden vorgegeben.
# Dazu wird für jeden Zeitslot geprüft, ob dort das jeweilige Fach liegt.
# Diese Information wird in einer Bool-Variable gespeichert und am Ende gezählt.

for k in klassen:
    for fach, anzahl in fachstunden[k].items():
        f_index = fach_indices[fach]  # Hole den Index des Fachs (z. B. 'Mathe' → 0)
        belegungen = []
        for t in range(len(tage)):
            for s in range(stunden_pro_tag):
                b = model.NewBoolVar(f'{k}_{fach}_{t}_{s}')  # Bool-Variable: ist das Fach hier belegt?
                model.Add(stundenplan[(k, t, s)] == f_index).OnlyEnforceIf(b)  # Wenn b=True, dann steht das Fach an dieser Stelle
                model.Add(stundenplan[(k, t, s)] != f_index).OnlyEnforceIf(b.Not())  # Wenn b=False, dann darf das Fach hier nicht stehen
                belegungen.append(b)  # Speichere die Info zur späteren Zählung
        model.Add(sum(belegungen) == anzahl)  # Das Fach muss genau 'anzahl' Mal in der Woche unterrichtet werden



# Einschränkung: Ein Lehrer darf nur Fächer unterrichten, für die er qualifiziert ist.
# Für jeden Zeitslot wird geprüft, ob ein Lehrer dort eingetragen ist.
# Falls ja, wird sichergestellt, dass das Fach in diesem Slot zu seinem Fachprofil gehört.
# Dies geschieht über eine Bool-Variable `b`, die angibt, ob der Lehrer dort unterrichtet.
# Wenn `b=True`, dann muss das Fach einem der erlaubten Fächer des Lehrers entsprechen.

for k in klassen:
    for t in range(len(tage)):
        for s in range(stunden_pro_tag):
            fach_var = stundenplan[(k, t, s)]     # Fach, das in diesem Slot unterrichtet wird
            lehrer_var = lehrerplan[(k, t, s)]    # Lehrer, der in diesem Slot unterrichtet

            for lehrer, info in lehrer_info.items():
                l_index = lehrer_indices[lehrer]  # Index dieses Lehrers
                erlaubte_faecher = [fach_indices[f] for f in info['faecher']]  # Liste seiner unterrichtbaren Fächer

                # Bool-Variable: Ist dieser Lehrer in diesem Slot im Einsatz?
                b = model.NewBoolVar(f'lehrer_{lehrer}_{k}_{t}_{s}')
                model.Add(lehrer_var == l_index).OnlyEnforceIf(b)      # Wenn b=True → Lehrer muss eingetragen sein
                model.Add(lehrer_var != l_index).OnlyEnforceIf(b.Not())  # Wenn b=False → Lehrer darf nicht eingetragen sein

                # Fach darf in diesem Slot nur eines der erlaubten Fächer dieses Lehrers sein
                model.AddAllowedAssignments([fach_var], [[f] for f in erlaubte_faecher]).OnlyEnforceIf(b)


# Einschränkungen zur Lehrerbelastung:
# Für jeden Lehrer wird überprüft:
# - dass er pro Stunde (Zeitslot) höchstens in einer Klasse gleichzeitig unterrichtet,
# - dass er insgesamt in der Woche nicht mehr Stunden unterrichtet als erlaubt.
# Dazu wird für jeden Slot und jede Klasse eine Bool-Variable erstellt, die angibt, ob
# der Lehrer dort eingesetzt ist. Die Summe dieser Variablen ergibt die Arbeitszeit.

for lehrer, l_index in lehrer_indices.items():
    belegungen = []  # Liste aller Unterrichtseinsätze dieses Lehrers über die Woche

    for t in range(len(tage)):  # Iteriere über alle Tage
        for s in range(stunden_pro_tag):  # Iteriere über jede Stunde pro Tag
            for k in klassen:  # Iteriere über alle Klassen
                # Bool-Variable: Lehrer ist in dieser Klasse zu diesem Zeitpunkt im Einsatz
                b = model.NewBoolVar(f'{lehrer}_belegt_{k}_{t}_{s}')
                model.Add(lehrerplan[(k, t, s)] == l_index).OnlyEnforceIf(b)     # Lehrer ist eingetragen
                model.Add(lehrerplan[(k, t, s)] != l_index).OnlyEnforceIf(b.Not())  # Lehrer ist nicht eingetragen
                belegungen.append(b)  # Speichern für spätere Summierung

            # Lehrer darf in diesem Zeitslot (über alle Klassen) nur einmal eingesetzt werden
            model.Add(sum(belegungen[-len(klassen):]) <= 1)

    # Begrenzung der Gesamtarbeitszeit in der Woche auf die zulässigen Stunden
    model.Add(sum(belegungen) <= lehrer_info[lehrer]['max_stunden'])



# Wenn keine Stunde belegt ist, dann darf auch kein Lehrer zugewiesen sein
for k in klassen:
    for t in range(len(tage)):
        for s in range(stunden_pro_tag):
            belegung = is_belegt[(k, t, s)]
            lehrer_var = lehrerplan[(k, t, s)]
            # Falls der Slot nicht belegt ist, muss lehrer_var == -1 sein
            model.Add(lehrer_var == -1).OnlyEnforceIf(belegung.Not())
            # Falls der Slot belegt ist, darf lehrer_var >= 0 sein
            model.Add(lehrer_var >= 0).OnlyEnforceIf(belegung)


# Weiche Nebenbedingung: Bevorzuge frühen Unterricht – Unterrichtsstunden früher am Tag sollen attraktiver sein.
# Ziel: Möglichst viele Unterrichtseinheiten sollen am Vormittag stattfinden (z. B. 1. bis 3. Stunde).
# Je früher eine belegte Stunde liegt, desto stärker wird sie in der Zielgröße gewichtet.

if FRUESTUNDEN_BEVORZUGEN == 1:
    for k in klassen:  # Für jede Klasse
        for t in range(len(tage)):  # Für jeden Tag
            for s in range(stunden_pro_tag):  # Für jede Stunde des Tages
                gewicht = (stunden_pro_tag - s)  # Frühere Stunden → höherer Wert (z. B. 8 - 0 = 8, 8 - 7 = 1)
                # Multipliziere die Belegungsvariable mit dem Gewicht und füge sie der Zielgröße hinzu
                zielvariablen.append(is_belegt[(k, t, s)] * gewicht)



# Weiche Nebenbedingung: Bevorzuge späten Unterricht – Unterrichtsstunden später am Tag sollen attraktiver sein.
# Ziel ist z. B., dass Randstunden am Nachmittag (z. B. 6./7./8. Stunde) eher genutzt werden als der frühe Morgen.
# Für jede belegte Stunde wird ein Gewicht vergeben, das mit dem Stundenindex steigt → spätere Stunden = höhere Belohnung

if FRUESTUNDEN_BEVORZUGEN == 0:
    for k in klassen:  # Für jede Klasse
        for t in range(len(tage)):  # Für jeden Tag
            for s in range(stunden_pro_tag):  # Für jede Stunde des Tages
                gewicht = s  # Je später die Stunde, desto höher der Wert (z. B. 0 = früh, 7 = spät)
                # Wenn die Stunde belegt ist, trägt sie (gewicht) zur Zielgröße bei, sonst 0
                zielvariablen.append(is_belegt[(k, t, s)] * gewicht)




# Weiche Nebenbedingung: Bevorzuge Doppelstunden – ein Fach soll möglichst in zwei aufeinanderfolgenden Stunden liegen.
# Dadurch entsteht ein "Blockunterricht", der organisatorisch oft wünschenswert ist (z. B. bei Mathe oder Sport).
if(BLOCKBILDUNG == 1):
    fachblock_boni = []  # Liste zur Sammlung aller erkannten "Fachblöcke", die später als Bonus in die Zielfunktion eingehen

    for k in klassen:  # Iteriere über alle Klassen
        for fach, _ in fachstunden[k].items():  # Nur die Fächer, die in der Klasse unterrichtet werden
            f_index = fach_indices[fach]  # Index des Fachs im Stundenplan
            for t in range(len(tage)):  # Für jeden Wochentag
                for s in range(stunden_pro_tag - 1):  # Vergleiche immer zwei aufeinanderfolgende Stunden (s und s+1)
                    
                    # Erstelle Bool-Variablen: Ist das Fach in Stunde s bzw. s+1?
                    b1 = model.NewBoolVar(f'{k}_{fach}_{t}_{s}_block1')  # Ist das Fach in Stunde s?
                    b2 = model.NewBoolVar(f'{k}_{fach}_{t}_{s}_block2')  # Ist das Fach in Stunde s+1?

                    # Wenn Fach in Stunde s liegt, dann b1 = True
                    model.Add(stundenplan[(k, t, s)] == f_index).OnlyEnforceIf(b1)
                    model.Add(stundenplan[(k, t, s)] != f_index).OnlyEnforceIf(b1.Not())

                    # Wenn Fach in Stunde s+1 liegt, dann b2 = True
                    model.Add(stundenplan[(k, t, s + 1)] == f_index).OnlyEnforceIf(b2)
                    model.Add(stundenplan[(k, t, s + 1)] != f_index).OnlyEnforceIf(b2.Not())

                    # Neue Variable: beide = True genau dann, wenn sowohl b1 als auch b2 True sind
                    # → also wenn das Fach direkt nacheinander in zwei Stunden vorkommt
                    beide = model.NewBoolVar(f'{k}_{fach}_{t}_{s}_beide')
                    model.AddBoolAnd([b1, b2]).OnlyEnforceIf(beide)
                    model.AddBoolOr([b1.Not(), b2.Not()]).OnlyEnforceIf(beide.Not())

                    # Speichere die Block-Variable für spätere Optimierung
                    fachblock_boni.append(beide)
                    # Belohne Blockbildung mit einem Bonus in der Zielfunktion
                    zielvariablen.append(beide * GEWICHT_BLOCKBILDUNG)  # Gewichtung der Doppelstunden in der Zielfunktion



# Einschränkung: Begrenze, wie oft ein Fach pro Tag in einer Klasse unterrichtet werden darf
# Ziel: Ein Fach soll an einem einzelnen Tag maximal MAX_STUNDEN_PRO_TAG Mal vorkommen
# Beispiel: Wenn MAX_STUNDEN_PRO_TAG = 2, darf Mathe an einem Tag höchstens zweimal auftauchen (egal ob zusammenhängend oder nicht)

for k in klassen:  # Für jede Klasse
    for fach, _ in fachstunden[k].items():  # Nur Fächer, die in dieser Klasse unterrichtet werden
        f_index = fach_indices[fach]  # Fachindex (z. B. "Mathe" → 0)
        for t in range(len(tage)):  # Für jeden Tag
            belegungen = []  # Liste der Slots, in denen das Fach an diesem Tag liegt
            for s in range(stunden_pro_tag):  # Für jede Stunde des Tages
                b = model.NewBoolVar(f'{k}_{fach}_{t}_{s}_taglimit')
                # b = True ⇔ in diesem Slot liegt das betrachtete Fach
                model.Add(stundenplan[(k, t, s)] == f_index).OnlyEnforceIf(b)
                model.Add(stundenplan[(k, t, s)] != f_index).OnlyEnforceIf(b.Not())
                belegungen.append(b)
            # Die Summe der belegten Stunden für dieses Fach an diesem Tag darf den Grenzwert nicht überschreiten
            model.Add(sum(belegungen) <= MAX_STUNDEN_PRO_TAG)


# Zielfunktion festlegen
model.Maximize(sum(zielvariablen))


# Solver
solver = cp_model.CpSolver()
solver.parameters.max_time_in_seconds = MAX_TIME_FOR_SOLVING

solver.parameters.num_search_workers = 3  # Anzahl genutzter CPU Kerne
#solver.parameters.linearization_level = 0  # Geringere Komplexität
#solver.parameters.cp_model_presolve = True

status = solver.Solve(model)


if status in [cp_model.OPTIMAL, cp_model.FEASIBLE]:
    # Ausgabe der Stundenpläne für Klassen mit Fach (Lehrer)
    for k in klassen:
        print(f"\nStundenplan für Klasse {k}:")
        for t_index, tag in enumerate(tage):
            stunden = []
            for s in range(stunden_pro_tag):
                fach_index = solver.Value(stundenplan[(k, t_index, s)])
                lehrer_index = solver.Value(lehrerplan[(k, t_index, s)])
                if fach_index >= 0 and lehrer_index >= 0:
                    fach = faecher[fach_index]
                    lehrer = list(lehrer_info.keys())[lehrer_index]
                    eintrag = f"{fach} ({lehrer})"
                else:
                    eintrag = "frei"
                stunden.append(eintrag)
            print(f"{tag}: {', '.join(stunden)}")

    # Ausgabe der Stundenpläne für Lehrer mit Fach (Klasse)
    lehrer_namen = list(lehrer_info.keys())
    for lehrer_index, lehrer in enumerate(lehrer_namen):
        print(f"\nStundenplan für Lehrer {lehrer}:")
        for t_index, tag in enumerate(tage):
            stunden = []
            for s in range(stunden_pro_tag):
                eintrag = "frei"
                for k in klassen:
                    if solver.Value(lehrerplan[(k, t_index, s)]) == lehrer_index:
                        fach_index = solver.Value(stundenplan[(k, t_index, s)])
                        fach = faecher[fach_index]
                        eintrag = f"{fach} ({k})"
                        break  # Ein Lehrer kann nur in einer Klasse pro Slot sein
                stunden.append(eintrag)
            print(f"{tag}: {', '.join(stunden)}")
else:
    print("Keine Lösung gefunden.")

